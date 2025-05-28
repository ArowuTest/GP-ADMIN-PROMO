// src/services/authService.ts
import { apiClient } from './apiClient';
import { authManager } from './authManager';

// Define response types for better type safety
export interface AuthResponse {
  token: string;
  user: any;
  expiresAt?: string;
}

// Main authentication service
const login = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    
    // Handle different response formats
    let token: string;
    let user: any;
    let expiresAt: string | undefined;
    
    // Extract data based on response structure
    if (response.data && response.data.data) {
      // Nested data structure
      const data = response.data.data;
      token = data.token || '';
      user = data.user || {};
      expiresAt = data.expiresAt;
    } else if (response.data) {
      // Direct data structure
      token = response.data.token || '';
      user = response.data.user || {};
      expiresAt = response.data.expiresAt;
    } else {
      throw new Error('Invalid response format');
    }
    
    // Store authentication data
    if (token) {
      storeToken(token);
      storeUser(user);
      if (expiresAt) {
        storeTokenExpiry(expiresAt);
      }
    }
    
    return { token, user, expiresAt };
  } catch (error: any) {
    console.error('Login error:', error);
    // Enhanced error logging for debugging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

// Token storage and retrieval
const storeToken = (token: string): void => {
  authManager.storeToken(token);
};

const getToken = (): string | null => {
  return authManager.getToken();
};

// User data storage and retrieval
const storeUser = (user: any): void => {
  authManager.storeUser(user);
};

const getUser = (): any => {
  return authManager.getUser();
};

// Token expiry management
const storeTokenExpiry = (expiryTime: string): void => {
  authManager.storeTokenExpiry(expiryTime);
};

const getTokenExpiry = (): string | null => {
  return authManager.getTokenExpiry();
};

const isTokenExpired = (): boolean => {
  return authManager.isTokenExpired();
};

// Clear all authentication data
const clearAuthData = (): void => {
  authManager.clearAuthData();
};

// Get authentication headers for API requests
const getAuthHeaders = (): Record<string, string> => {
  const token = authManager.getToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  return {};
};

// Check authentication state
const checkAuthState = (): boolean => {
  const token = getToken();
  return !!token && !isTokenExpired();
};

// Compatibility aliases for backward compatibility
const getUserData = (): any => {
  return getUser();
};

const setUserData = (user: any): void => {
  storeUser(user);
};

const setToken = (token: string): void => {
  storeToken(token);
};

// Export the service
export const authService = {
  login,
  storeToken,
  getToken,
  storeUser,
  getUser,
  getUserData, // Alias for backward compatibility
  setUserData, // Alias for backward compatibility
  setToken,    // Alias for backward compatibility
  storeTokenExpiry,
  getTokenExpiry,
  isTokenExpired,
  clearAuthData,
  getAuthHeaders,
  checkAuthState
};

// Default export for backward compatibility
export default authService;
