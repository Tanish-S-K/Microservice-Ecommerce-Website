import api from './axios';
import { BundleSuggestion, RecommendationResponse } from '../types';

export const getRecommendations = (userId: string) =>
  api.get<RecommendationResponse>(`/api/recommendations/${userId}`);

export const getSimilar = (productId: string) =>
  api.get<RecommendationResponse>(`/api/recommendations/similar/${productId}`);

export const recordBehavior = (data: { userId: string; productId: string; action: string }) =>
  api.post('/api/recommendations/behavior', data);

export const getBundleSuggestions = () =>
  api.get<BundleSuggestion[]>('/api/recommendations/bundles/suggest');
