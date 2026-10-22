export interface CreatePaymentOrderResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    razorpayOrderId: string;
    amount: number;
    currency: 'INR';
    keyId: string;
  };
}

export interface VerifyPaymentPayload {
  internalOrderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    success: boolean;
    orderId: string;
    alreadyProcessed: boolean;
  };
}

export interface RazorpayCheckoutSuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export type PaymentFlowResult =
  | { state: 'paid'; orderId: string; alreadyProcessed?: boolean }
  | { state: 'cancelled' }
  | { state: 'pending'; orderId: string }
  | { state: 'failed'; orderId: string; reason?: string };

export interface PaymentSuccessEvent {
  orderId: string;
  transactionId: string;
  paymentStatus: string;
}

export interface PaymentFailedEvent {
  orderId: string;
  reason: string;
}