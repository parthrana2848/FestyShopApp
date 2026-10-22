import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import { PaymentService } from '../api/paymentService';
import { PENDING_PAYMENT_ORDER_KEY } from '../constants/api';
import { RAZORPAY_KEY_ID } from '../config/payment';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../modules/video-call/services/socket.service';
import type {
  PaymentFailedEvent,
  PaymentFlowResult,
  PaymentSuccessEvent,
} from '../types/payment.types';
import type { OrderPaymentStatus } from '../api/orderService';

interface PayForOrderOptions {
  contact: string;
  isNewOrder: boolean;
}

const resultFromStatus = (orderId: string, status: OrderPaymentStatus): PaymentFlowResult => {
  if (status === 'PAID') {
    return { state: 'paid', orderId };
  }
  if (status === 'PENDING') {
    return { state: 'pending', orderId };
  }
  return { state: 'failed', orderId, reason: 'Payment was not completed.' };
};

const getErrorMessage = (error: unknown): string | undefined => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'description' in error) {
    const description = error.description;
    return typeof description === 'string' ? description : undefined;
  }
  return undefined;
};

const isCancellation = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false;
  }
  return error.code === 0 || error.code === '0';
};

export const useRazorpayCheckout = () => {
  const { token, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [paymentUpdate, setPaymentUpdate] = useState<PaymentFlowResult | null>(null);
  const processingRef = useRef(false);

  const reconcile = useCallback(async (orderId: string): Promise<PaymentFlowResult> => {
    try {
      const status = await PaymentService.reconcileOrderStatus(orderId);
      return resultFromStatus(orderId, status);
    } catch {
      return { state: 'pending', orderId };
    }
  }, []);

  const settleAsPaid = useCallback(async (orderId: string): Promise<PaymentFlowResult> => {
    try {
      await AsyncStorage.removeItem(PENDING_PAYMENT_ORDER_KEY);
    } catch (error) {
      console.warn('Unable to clear the persisted payment order:', getErrorMessage(error));
    }
    setPendingOrderId(null);
    return { state: 'paid', orderId };
  }, []);

  useEffect(() => {
    let active = true;

    const restorePendingOrder = async () => {
      try {
        const storedOrderId = await AsyncStorage.getItem(PENDING_PAYMENT_ORDER_KEY);
        if (!storedOrderId || !active) {
          return;
        }

        setPendingOrderId(storedOrderId);
        const result = await reconcile(storedOrderId);
        if (!active) {
          return;
        }

        if (result.state === 'paid') {
          await settleAsPaid(storedOrderId);
        }
        setPaymentUpdate(result);
      } catch {
        // Keep the persisted order available for a later retry.
      } finally {
        if (active) {
          setIsRestoring(false);
        }
      }
    };

    restorePendingOrder().catch(() => undefined);
    return () => {
      active = false;
    };
  }, [reconcile, settleAsPaid]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const handlePaymentSuccess = async (event: PaymentSuccessEvent) => {
      if (event.orderId !== pendingOrderId) {
        return;
      }
      const result = await reconcile(event.orderId);
      if (result.state === 'paid') {
        await settleAsPaid(event.orderId);
      }
      setPaymentUpdate(result);
    };

    const handlePaymentFailed = async (event: PaymentFailedEvent) => {
      if (event.orderId !== pendingOrderId) {
        return;
      }
      const result = await reconcile(event.orderId);
      if (result.state === 'paid') {
        await settleAsPaid(event.orderId);
        setPaymentUpdate(result);
        return;
      }
      if (result.state === 'pending') {
        setPaymentUpdate(result);
        return;
      }
      setPaymentUpdate({
        state: 'failed',
        orderId: event.orderId,
        reason: event.reason,
      });
    };

    const handleReconnect = async () => {
      if (!pendingOrderId) {
        return;
      }
      const result = await reconcile(pendingOrderId);
      if (result.state === 'paid') {
        await settleAsPaid(pendingOrderId);
      }
      setPaymentUpdate(result);
    };

    const unsubscribeSuccess = socketService.onPaymentSuccess(handlePaymentSuccess);
    const unsubscribeFailed = socketService.onPaymentFailed(handlePaymentFailed);
    const unsubscribeReconnect = socketService.onReconnect(() => {
      handleReconnect().catch((error: unknown) => {
        console.warn('Payment reconciliation after reconnect failed:', getErrorMessage(error));
      });
    });

    if (!socketService.isConnected) {
      socketService.connect(token).catch((error: unknown) => {
        console.warn('Payment socket connection unavailable:', getErrorMessage(error));
      });
    }

    return () => {
      unsubscribeSuccess();
      unsubscribeFailed();
      unsubscribeReconnect();
    };
  }, [pendingOrderId, reconcile, settleAsPaid, token]);

  const payForOrder = useCallback(async (
    orderId: string,
    options: PayForOrderOptions,
  ): Promise<PaymentFlowResult> => {
    if (processingRef.current) {
      return { state: 'pending', orderId };
    }

    processingRef.current = true;
    setIsProcessing(true);
    setPendingOrderId(orderId);

    try {
      await AsyncStorage.setItem(PENDING_PAYMENT_ORDER_KEY, orderId);

      if (!options.isNewOrder) {
        let status: OrderPaymentStatus;
        try {
          status = await PaymentService.reconcileOrderStatus(orderId);
        } catch {
          return { state: 'pending', orderId };
        }

        if (status === 'PAID') {
          return await settleAsPaid(orderId);
        }
        if (status === 'PENDING') {
          return { state: 'pending', orderId };
        }
      }

      try {
        const gatewayOrder = await PaymentService.createGatewayOrder(orderId);
        if (!gatewayOrder.success) {
          throw new Error(gatewayOrder.message || 'Unable to start payment.');
        }

        const { amount, currency, keyId, razorpayOrderId } = gatewayOrder.data;
        console.log("get Key ", gatewayOrder.data)
        if (!Number.isInteger(amount) || amount <= 0) {
          throw new Error('Payment amount must be an integer in paise.');
        }
        const key = keyId || RAZORPAY_KEY_ID;
        if (!key) {
          throw new Error('Razorpay is not configured.');
        }

        const payment = await RazorpayCheckout.open({
          key,
          amount:1,
          currency,
          order_id: razorpayOrderId,
          name: 'FesShop',
          description: `Order #${orderId}`,
          prefill: {
            name: user?.name ?? '',
            email: user?.email ?? '',
            contact: options.contact,
          },
          theme: { color: '#176B57' },
        });

        const verified = await PaymentService.verifyPayment({
          internalOrderId: orderId,
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
        });

        if (verified.data.success || verified.data.alreadyProcessed) {
          return await settleAsPaid(orderId);
        }
        throw new Error(verified.message || 'Payment verification failed.');
      } catch (error) {
        if (isCancellation(error)) {
          return { state: 'cancelled' };
        }

        const reconciled = await reconcile(orderId);
        if (reconciled.state === 'paid') {
          return await settleAsPaid(orderId);
        }
        if (reconciled.state === 'pending') {
          return reconciled;
        }
        if (reconciled.state === 'failed') {
          return {
            ...reconciled,
            reason: getErrorMessage(error) ?? reconciled.reason,
          };
        }
      }

      const reconciled = await reconcile(orderId);
      if (reconciled.state === 'paid') {
        return await settleAsPaid(orderId);
      }
      return reconciled;
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [reconcile, settleAsPaid, user]);

  return {
    isProcessing,
    isRestoring,
    pendingOrderId,
    paymentUpdate,
    payForOrder,
  };
};