// src/services/apiClient.ts
import axios from 'axios';
import { authManager } from './authManager';

// Debug flag to enable detailed request/response logging
const DEBUG = true;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://gp-backend-promo.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials to ensure cookies are sent with requests
  withCredentials: true,
});

// Add request interceptor to include auth token in every request
apiClient.interceptors.request.use(
  (config) => {
    // Get the current token before each request
    const token = authManager.getToken();
    
    if (DEBUG) {
      console.log(`API Request to ${config.url}`, { 
        hasToken: !!token,
        method: config.method,
        url: config.url,
        headers: config.headers
      });
    }
    
    // If token exists, add it to the Authorization header
    // CRITICAL FIX: Create a new headers object instead of modifying the existing one
    // This prevents the "Cannot assign to read only property 'Authorization'" error
    if (token) {
      config.headers = { 
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    return config;
  },
  (error) => {
    if (DEBUG) {
      console.error('API Request error:', error);
    }
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.log(`API Response from ${response.config.url}`, { 
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        authHeader: response.config.headers['Authorization'] ? 'present' : 'missing'
      });
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (DEBUG) {
      console.error('API Response error:', {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        authHeader: error.config?.headers?.['Authorization'] ? 'present' : 'missing'
      });
    }
    
    // CRITICAL FIX: Only handle 401/403 errors if they're not from the login endpoint
    // This prevents logout during login failures
    if (error.response && 
        (error.response.status === 401 || error.response.status === 403) && 
        !error.config.url.includes('/auth/login')) {
      
      console.warn(`Authentication error (${error.response.status}) detected for ${error.config.url}, clearing auth data`);
      
      // Clear auth data on authentication errors
      authManager.clearAuthData();
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        console.log('Redirecting to login page due to authentication error');
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
  
  if (DEBUG) {
    console.log(`getAuthHeaders called, token available: ${!!authToken}`);
  }
  
  return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
};

export { apiClient };
export default apiClient;
