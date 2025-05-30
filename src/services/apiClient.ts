// src/services/apiClient.ts
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, CancelTokenSource } from 'axios';
import { authManager } from './authManager';
import { ApiResponse, PaginatedResponse } from '../types/api';

// Map to store active requests for cancellation
const activeRequests: Map<string, CancelTokenSource> = new Map();

// Create a base axios instance with common configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://gp-backend-promo.onrender.com/api/v1',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Generate a unique request key
const getRequestKey = (config: AxiosRequestConfig): string => {
  return `${config.method || 'unknown'}-${config.url || 'unknown'}-${JSON.stringify(config.params || {})}`;
};

// Cancel previous identical requests
const cancelPreviousRequests = (config: AxiosRequestConfig): void => {
  const requestKey = getRequestKey(config);
  if (activeRequests.has(requestKey)) {
    const source = activeRequests.get(requestKey);
    if (source) {
      source.cancel(`Request canceled due to duplicate: ${requestKey}`);
      activeRequests.delete(requestKey);
    }
  }
};

// Request interceptor for adding auth token and handling cancellation
apiClient.interceptors.request.use(
  (config) => {
    // Get token from auth manager
    const token = authManager.getToken();
    
    // If token exists, add it to the Authorization header
    if (token) {
      // Create a new headers object to avoid modifying read-only properties
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      } as any;
      
      // Debug logging
      console.log(`[API_CLIENT] Adding token to request: ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`[API_CLIENT] No token available for request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // Enable credentials for CORS
    config.withCredentials = true;
    
    // Handle request cancellation for duplicate requests
    if (config.url && !config.url.includes('/auth/login')) {
      cancelPreviousRequests(config);
      
      // Create a new cancel token source
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      
      // Store the cancel token source
      const requestKey = getRequestKey(config);
      activeRequests.set(requestKey, source);
    }
    
    return config;
  },
  (error) => {
    console.error('[API_CLIENT] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors and response transformation
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API_CLIENT] Response success: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    
    // Clean up the active request
    if (response.config.url) {
      const requestKey = getRequestKey(response.config);
      activeRequests.delete(requestKey);
    }
    
    // Transform response data if needed
    if (response.data) {
      // Check if the response follows the standard API response format
      if (typeof response.data.success === 'boolean') {
        // Already in the expected format, return as is
        return response;
      } else {
        // Wrap in standard format
        response.data = {
          success: true,
          data: response.data
        };
      }
    }
    
    return response;
  },
  (error) => {
    // Clean up the active request if it exists
    if (error.config && error.config.url) {
      const requestKey = getRequestKey(error.config);
      activeRequests.delete(requestKey);
    }
    
    // Handle axios cancellation
    if (axios.isCancel(error)) {
      console.log('[API_CLIENT] Request canceled:', error.message);
      return Promise.reject(error);
    }
    
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`[API_CLIENT] Response error: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error('[API_CLIENT] Error data:', error.response.data);
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        console.warn('[API_CLIENT] Authentication error - token may be invalid or expired');
        // Emit an event for auth error handling
        const authErrorEvent = new CustomEvent('auth-error', {
          detail: { status: error.response.status, message: 'Authentication failed' }
        });
        window.dispatchEvent(authErrorEvent);
      }
      
      // Transform error response to standard format if needed
      if (error.response.data) {
        if (typeof error.response.data.success !== 'boolean') {
          error.response.data = {
            success: false,
            error: error.response.data.message || error.message || 'Unknown error',
            details: error.response.data
          };
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`[API_CLIENT] Request error - no response: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      
      // Create a standardized error response
      error.response = {
        data: {
          success: false,
          error: 'Network error - no response received',
          details: 'The server did not respond to the request'
        }
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('[API_CLIENT] Request setup error:', error.message);
      
      // Create a standardized error response
      error.response = {
        data: {
          success: false,
          error: 'Request setup error',
          details: error.message
        }
      };
    }
    
    return Promise.reject(error);
  }
);

// Type-safe request methods
const get = async <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.get<ApiResponse<T>>(url, { ...config, params });
  return response.data.data as T;
};

const getPaginated = async <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<PaginatedResponse<T>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<T>>>(url, { ...config, params });
  return response.data.data;
};

const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.post<ApiResponse<T>>(url, data, config);
  return response.data.data as T;
};

const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.put<ApiResponse<T>>(url, data, config);
  return response.data.data as T;
};

const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.delete<ApiResponse<T>>(url, config);
  return response.data.data as T;
};

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = authManager.getToken();
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  
  return {};
};

// Cancel all active requests
const cancelAllRequests = (message = 'Operation canceled by user'): void => {
  activeRequests.forEach((source) => {
    source.cancel(message);
  });
  activeRequests.clear();
};

// Enhanced API client with type-safe methods
export const enhancedApiClient = {
  get,
  getPaginated,
  post,
  put,
  delete: del,
  getAuthHeaders,
  cancelAllRequests,
  instance: apiClient
};

// Export both the instance and the enhanced client
export { apiClient, getAuthHeaders };

// Default export for backward compatibility
export default enhancedApiClient;
