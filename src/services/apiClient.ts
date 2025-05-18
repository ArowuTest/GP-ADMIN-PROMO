// src/services/apiClient.ts
import axios from 'axios';

// Create an axios instance with default configuration
export const apiClient = axios.create({
  baseURL: 'https://gp-backend-promo.onrender.com/api/v1',
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Helper function to get auth headers
export const getAuthHeaders = (token: string) => {
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Add a request interceptor
apiClient.interceptors.request.use(
  config => {
    // You can modify the request config here
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle 401 Unauthorized errors (except for login attempts)
    if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/login')) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
