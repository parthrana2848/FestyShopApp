import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { OrderService } from '../api/orderService';
import type { CreateOrderPayload, ReorderPayload } from '../types/order';

// Query for fetching user orders
export const useUserOrdersQuery = () => {
  return useQuery({
    queryKey: ['userOrders'],
    queryFn: () => OrderService.getUserOrders(),
  });
};

// Mutation for creating order
export const useCreateOrderMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => OrderService.createOrder(payload),
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create order';
      console.error('Create order error:', error);
      Alert.alert('Order Error', errorMessage);
    },
  });
};

// Mutation for reordering
export const useReorderMutation = () => {
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: ReorderPayload }) =>
      OrderService.reorderOrder(orderId, payload),
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to reorder';
      console.error('Reorder error:', error);
      Alert.alert('Reorder Error', errorMessage);
    },
  });
};
