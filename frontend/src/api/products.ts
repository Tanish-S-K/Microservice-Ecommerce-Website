import api from './axios';
import { PagedResponse, Product } from '../types';

export const getProducts = (params: {
  category?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => api.get<PagedResponse<Product>>('/api/products', { params });

export const getProduct = (id: string) => api.get<Product>(`/api/products/${id}`);

export const getCategories = () => api.get<string[]>('/api/products/categories');
