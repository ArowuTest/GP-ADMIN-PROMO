// src/services/apiClient.ts - Fixed version with enhanced debugging
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { authManager } from './authManager';

// Create a base axios instance with common configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding auth token
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
    
    return config;
  },
  (error) => {
    console.error('[API_CLIENT] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API_CLIENT] Response success: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`[API_CLIENT] Response error: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error('[API_CLIENT] Error data:', error.response.data);
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        console.warn('[API_CLIENT] Authentication error - token may be invalid or expired');
        // Don't automatically clear auth data here to prevent logout loops
        // Let the component handle this based on context
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`[API_CLIENT] Request error - no response: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('[API_CLIENT] Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get auth headers
// This function accepts an optional token parameter for backward compatibility
const getAuthHeaders = (token?: string): Record<string, string> => {
  // Use provided token or get from auth manager
  const authToken = token || authManager.getToken();
  
  // Return headers object
  if (authToken) {
    return {
      'Authorization': `Bearer ${authToken}`
    };
  }
  
  return {};
};

// Export both the instance and the getAuthHeaders function
export { apiClient, getAuthHeaders };

// Default export for backward compatibility
export default apiClient;
