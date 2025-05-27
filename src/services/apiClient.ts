// src/services/apiClient.ts
import axios from 'axios';
import { authManager } from './authManager';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://gp-backend-promo.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in every request
apiClient.interceptors.request.use(
  (config) => {
    // Get the current token before each request
    const token = authManager.getToken();
    
    // Log the request for debugging
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    console.log('Token available for request:', !!token);
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    console.log(`Received successful response from ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log error response for debugging
    console.error('API response error:', error);
    
    // Handle authentication errors (401 Unauthorized, 403 Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Authentication error detected, logging out');
      // Clear auth data on authentication errors
      authManager.clearAuthData();
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        console.log('Redirecting to login page');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Re-export getAuthHeaders for backward compatibility with existing services
export const getAuthHeaders = (token?: string): Record<string, string> => {
  // If token is provided, use it; otherwise get from authManager
  const authToken = token || authManager.getToken();
  return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
};

export { apiClient };
export default apiClient;
