import type { CartItem } from './cart';

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI';
export type PaymentStatus = 'PENDING' | 'PAID';

export type CustomerSnapshot = {
  name: string;
  phone: string;
};

export type Order = {
  _id: string;
  customerSnapshot: CustomerSnapshot;
  items: CartItem[];
  subTotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderPayload = {
  customerSnapshot: CustomerSnapshot;
  items: CartItem[];
  subTotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
};

export type OrderResponse = {
  data: Order;
  message: string;
  success: boolean;
};

export type ReorderPayload = {
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
};
