import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'ngrok-skip-browser-warning': 'true' // Bypass ngrok HTML intercept on GET requests
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Prevent React unhandled crashes when Vercel returns the index.html for API routes
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype html>')) {
      return Promise.reject(new Error('Backend is not yet connected. Received HTML instead of JSON.'));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
