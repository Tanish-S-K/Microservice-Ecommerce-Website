import api from './axios';
import { AuthResponse, User } from '../types';

export const register = (data: { name: string; email: string; password: string }) =>
  api.post<AuthResponse>('/api/users/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post<AuthResponse>('/api/users/login', data);

export const getMe = () => api.get<User>('/api/users/me');

export const updateProfile = (data: { name: string }) => api.put<User>('/api/users/me', data);
