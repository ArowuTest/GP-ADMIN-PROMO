// src/services/apiClient.ts
import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { authManager } from './authManager';

// Debug flag to enable detailed logging
const DEBUG = true;

// API base URL - update this to match your backend URL
const API_BASE_URL = 'https://gp-backend-promo.onrender.com/api/v1';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // Changed from true to false for cross-origin
} );

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from auth manager
    const token = authManager.getToken();
    
    if (DEBUG) {
      console.log('[API] Request interceptor:', { 
        url: config.url, 
        method: config.method,
        hasToken: !!token
      });
    }
    
    // If token exists, add it to request headers
    if (token) {
      // CRITICAL FIX: Create a new headers object instead of modifying the existing one
      // This prevents "Cannot set headers after they are sent" errors
      const headers = new Headers();
      
      // Copy existing headers
      if (config.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            headers.set(key, value.toString());
          }
        });
      }
      
      // Add Authorization header with token
      headers.set('Authorization', `Bearer ${token}`);
      
      // Convert Headers object back to plain object for axios
      const plainHeaders: Record<string, string> = {};
      headers.forEach((value, key) => {
        plainHeaders[key] = value;
      });
      
      // Update config with new headers
      config.headers = plainHeaders;
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.log('[API] Response interceptor:', { 
        url: response.config.url, 
        status: response.status,
        hasData: !!response.data
      });
    }
    return response;
  },
  async (error) => {
    if (DEBUG) {
      console.error('[API] Response error:', error);
    }
    
    // Check if error is due to authentication
    if (error.response && error.response.status === 401) {
      if (DEBUG) {
        console.log('[API] Authentication error, clearing auth data');
      }
      
      // Clear authentication data
      authManager.clearAuthData();
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Retry request function for handling network errors
export const retryRequest = async (originalRequest: AxiosRequestConfig, retryCount = 0): Promise<AxiosResponse> => {
  try {
    if (DEBUG) {
      console.log(`[API] Retrying request (attempt ${retryCount + 1})`, originalRequest.url);
    }
    return await apiClient(originalRequest);
  } catch (error: unknown) {
    // Type guard for error object
    const isAxiosError = axios.isAxiosError(error);
    const errorMessage = isAxiosError ? error.message : String(error);
    const errorStatus = isAxiosError && error.response ? error.response.status : undefined;
    
    // Max 3 retry attempts
    if (retryCount < 3 && (!errorStatus || errorStatus >= 500)) {
      if (DEBUG) {
        console.log(`[API] Request failed, retrying... (${retryCount + 1}/3)`);
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return retryRequest(originalRequest, retryCount + 1);
    }
    
    throw error;
  }
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const authToken = authManager.getToken();
  return authToken ? { 
    'Authorization': `Bearer ${authToken}`
  } : {};
};

export default apiClient;
