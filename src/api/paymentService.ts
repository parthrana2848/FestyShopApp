import {
  PAYMENTS_CREATE_ORDER,
  PAYMENTS_VERIFY,
} from '../constants/api';
import type {
  CreatePaymentOrderResponse,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
} from '../types/payment.types';
import { OrderService, type OrderPaymentStatus } from './orderService';
import apiClient from './axios';

export class PaymentService {
  static async createGatewayOrder(orderId: string): Promise<CreatePaymentOrderResponse> {
    const response = await apiClient.post<CreatePaymentOrderResponse>(PAYMENTS_CREATE_ORDER, {
      orderId,
    });
    return response.data;
  }

  static async verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
    const response = await apiClient.post<VerifyPaymentResponse>(PAYMENTS_VERIFY, payload);
    return response.data;
  }

  static async reconcileOrderStatus(orderId: string): Promise<OrderPaymentStatus> {
    return OrderService.getPaymentStatus(orderId);
  }
}