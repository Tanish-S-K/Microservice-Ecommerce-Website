import api from './axios';
import { BundleCheckResponse, BundleDeal, Cart, CartItem } from '../types';

export const getCart = (userId: string) => api.get<Cart>(`/api/cart/${userId}`);

export const addToCart = (userId: string, item: CartItem) => api.post<Cart>(`/api/cart/${userId}/add`, item);

export const updateCartItem = (userId: string, data: { productId: string; quantity: number }) =>
  api.put<Cart>(`/api/cart/${userId}/update`, data);

export const removeCartItem = (userId: string, productId: string) =>
  api.delete(`/api/cart/${userId}/remove/${productId}`);

export const clearCart = (userId: string) => api.delete(`/api/cart/${userId}/clear`);

export const getBundles = () => api.get<BundleDeal[]>('/api/cart/bundles');

export const checkBundles = (userId: string) =>
  api.get<BundleCheckResponse[]>(`/api/cart/bundles/check/${userId}`);
