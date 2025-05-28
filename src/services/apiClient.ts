// src/services/apiClient.ts
import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { authManager } from './authManager';

// Debug flag to enable detailed request/response logging
const DEBUG = true;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://gp-backend-promo.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // CORS FIX: Set withCredentials based on environment
  // Only use true for same-origin or when backend explicitly supports credentials
  withCredentials: false, // Changed from true to false for cross-origin requests
});

// Add request interceptor to include auth token in every request
apiClient.interceptors.request.use(
  (config) => {
    // Get the current token before each request
    const token = authManager.getToken();
    
    if (DEBUG) {
      console.log(`[API] Request to ${config.url}`, { 
        hasToken: !!token,
        method: config.method,
        url: config.url,
        headers: config.headers
      });
    }
    
    // CRITICAL FIX: Create a completely new config object to avoid modifying read-only properties
    const newConfig = { ...config };
    
    // Create a new headers object that's compatible with Axios
    // Using Record<string, string> to avoid TS7053 errors
    const headers: Record<string, string> = {};
    
    // Copy all existing headers
    if (newConfig.headers) {
      Object.entries(newConfig.headers as Record<string, any>).forEach(([key, value]) => {
        if (value !== undefined) {
          headers[key] = String(value);
        }
      });
    }
    
    // If token exists, add it to the Authorization header
    // CORS FIX: Only use standard Authorization header, remove custom X-Auth-Token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Replace the headers object
    newConfig.headers = headers;
    
    // Log the final headers for debugging
    if (DEBUG) {
      console.log('[API] Final request headers:', JSON.stringify(newConfig.headers));
    }
    
    return newConfig;
  },
  (error) => {
    if (DEBUG) {
      console.error('[API] Request error:', error);
    }
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.log(`[API] Response from ${response.config.url}`, { 
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
      console.error('[API] Response error:', {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        authHeader: error.config?.headers?.['Authorization'] ? 'present' : 'missing',
        // CORS FIX: Log CORS-related information
        corsError: error.message?.includes('CORS') || error.message?.includes('cross-origin')
      });
    }
    
    // CORS FIX: Detect and handle CORS errors specifically
    if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
      console.error('[API] CORS error detected. This may be due to cross-origin restrictions.');
      // Don't clear auth data for CORS errors as they're likely configuration issues
      return Promise.reject(error);
    }
    
    // CRITICAL FIX: Only handle 401/403 errors if they're not from the login endpoint
    // This prevents logout during login failures
    if (error.response && 
        (error.response.status === 401 || error.response.status === 403) && 
        !error.config.url.includes('/auth/login')) {
      
      console.warn(`[API] Authentication error (${error.response.status}) detected for ${error.config.url}, clearing auth data`);
      
      // Clear auth data on authentication errors
      authManager.clearAuthData();
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        console.log('[API] Redirecting to login page due to authentication error');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// CORS FIX: Add a retry mechanism for failed requests
// Fixed TypeScript errors by adding proper type annotations
export const retryRequest = async (originalRequest: AxiosRequestConfig, retryCount = 0): Promise<AxiosResponse> => {
  const maxRetries = 2;
  
  try {
    // Try the request with the current configuration
    return await axios(originalRequest);
  } catch (error: unknown) {
    // Type guard for error object
    const isAxiosError = axios.isAxiosError(error);
    const errorStatus = isAxiosError && error.response ? error.response.status : undefined;
    
    // If we've reached max retries or it's not a CORS/auth error, don't retry
    if (retryCount >= maxRetries || 
        !(isAxiosError && (
          error.message.includes('CORS') || 
          error.message.includes('cross-origin') ||
          errorStatus === 401 || 
          errorStatus === 403))) {
      return Promise.reject(error);
    }
    
    console.log(`[API] Retrying failed request (attempt ${retryCount + 1}/${maxRetries})`);
    
    // Create a new request with modified settings
    const newRequest: AxiosRequestConfig = { ...originalRequest };
    
    // Toggle withCredentials for retry
    newRequest.withCredentials = !originalRequest.withCredentials;
    
    // Retry with modified request
    return retryRequest(newRequest, retryCount + 1);
  }
};

// Re-export getAuthHeaders for backward compatibility with existing services
// CRITICAL FIX: Accept token parameter to match how it's called in service files
export const getAuthHeaders = (token?: string): Record<string, string> => {
  // If token is provided, use it; otherwise get from authManager
  const authToken = token || authManager.getToken();
  
  if (DEBUG) {
    console.log(`[API] getAuthHeaders called, token available: ${!!authToken}`);
  }
  
  // CORS FIX: Only return standard Authorization header, remove custom X-Auth-Token
  return authToken ? { 
    'Authorization': `Bearer ${authToken}`
  } : {};
};

// Export both as default and named export to fix import errors in other services
export { apiClient };
export default apiClient;
