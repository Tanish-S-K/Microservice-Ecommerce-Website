import api from './axios';
import { Order } from '../types';

export const createOrder = (data: {
  userId: string;
  items: Order['items'];
  subtotal: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  shippingAddress: string;
}) => api.post<Order>('/api/orders', data);

export const getUserOrders = (userId: string) => api.get<Order[]>(`/api/orders/user/${userId}`);

export const getOrder = (orderId: string) => api.get<Order>(`/api/orders/${orderId}`);

export const cancelOrder = (orderId: string) => api.put<Order>(`/api/orders/${orderId}/cancel`);
