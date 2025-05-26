// src/services/apiClient.ts
import axios from 'axios';
import { authManager } from './authManager';

// Create an axios instance with default configuration
export const apiClient = axios.create({
  baseURL: 'https://gp-backend-promo.onrender.com/api/v1',
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Add this to include cookies in cross-site requests
});

// Re-export getAuthHeaders for backward compatibility with existing services
export const getAuthHeaders = (token?: string): Record<string, string> => {
  // If token is provided, use it; otherwise get from authManager
  const authToken = token || authManager.getToken();
  return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
};

// Add a request interceptor
apiClient.interceptors.request.use(
  config => {
    // Log request for debugging
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);

    // Get token from authManager for every request
    const token = authManager.getToken();
    
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  response => {
    // Log successful response for debugging
    console.log(`Received successful response from ${response.config.url}`);
    return response;
  },
  error => {
    // Log error response for debugging
    console.error(`Error response from ${error.config?.url}:`, error.response?.status, error.response?.data);

    // Handle 401 Unauthorized errors (except for login attempts)
    if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/login')) {
      // Clear token and redirect to login
      authManager.clearAuthData();

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden errors
    if (error.response && error.response.status === 403) {
      console.error('Access forbidden. This could be due to insufficient permissions or an expired token.');
      
      // Check if token might be expired
      if (authManager.isTokenExpired()) {
        console.error('Token appears to be expired. Redirecting to login...');
        authManager.clearAuthData();
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);
