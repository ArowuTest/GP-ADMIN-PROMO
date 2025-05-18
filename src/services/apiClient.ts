// src/services/apiClient.ts
import axios from 'axios';

// Flag to control mock mode behavior - set to false to use real API
export const MOCK_MODE = false;

// Create a base axios instance with common configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://gp-backend-promo.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased default timeout to 15 seconds
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // In mock mode, log the error but don't redirect to login
    if (MOCK_MODE) {
      console.warn('API Error in mock mode:', error);
      return Promise.reject(error);
    }
    
    // Handle session expiration - but don't redirect on login page
    if (error.response && error.response.status === 401 && !window.location.pathname.includes('/login')) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
