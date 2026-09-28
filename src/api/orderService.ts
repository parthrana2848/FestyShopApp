import type { CreateOrderPayload, Order, OrderResponse, ReorderPayload } from '../types/order';
import apiClient from './axios';

export class OrderService {
  static async createOrder(payload: CreateOrderPayload): Promise<Order> {
    console.log('Creating order with payload:', payload);
    const response = await apiClient.post<OrderResponse>('/api/orders', payload);
    console.log('Order response:', response.data);
    return response.data.data;
  }

  static async getOrder(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/api/orders/${id}`);
    return response.data;
  }

  static async getUserOrders(): Promise<Order[]> {
    const response = await apiClient.get<{ data: Order[] }>('/api/orders');
    return response.data.data;
  }

  static async reorderOrder(orderId: string, payload: ReorderPayload): Promise<Order> {
    const response = await apiClient.post<OrderResponse>(`/api/orders/reorder/${orderId}`, payload);
    return response.data.data;
  }
}
