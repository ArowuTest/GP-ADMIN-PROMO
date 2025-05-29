// src/services/authService.ts
import { enhancedApiClient } from './apiClient';
import { authManager } from './authManager';
import { LoginRequest, LoginResponse, UserResponse } from '../types/api';
import { Permission, UserRole } from '../types/common';

// Define login credentials interface
export interface LoginCredentials {
  username: string;
  password: string;
}

// Main authentication service
const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    console.log('[AUTH_SERVICE] Sending login request');
    
    // Transform frontend credentials to match backend API contract
    const loginPayload: LoginRequest = {
      Email: credentials.username,
      Password: credentials.password
    };
    
    // Use the enhanced API client for better error handling
    const response = await enhancedApiClient.post<LoginResponse>('/auth/login', loginPayload);
    
    console.log('[AUTH_SERVICE] Login successful');
    
    // Store authentication data
    if (response.token) {
      authManager.storeToken(response.token);
      authManager.storeUser(response.user);
      if (response.expiry) {
        authManager.storeTokenExpiry(response.expiry);
      }
    }
    
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('[AUTH_SERVICE] Login error:', err.message);
    } else {
      console.error('[AUTH_SERVICE] Login error:', err);
    }
    throw err;
  }
};

// Check if token needs refresh (within 5 minutes of expiry)
const needsTokenRefresh = (): boolean => {
  const expiryTime = authManager.getTokenExpiry();
  if (!expiryTime) return false;
  
  try {
    const expiryDate = new Date(expiryTime);
    const now = new Date();
    
    // Check if token expires within 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    return expiryDate.getTime() - now.getTime() < fiveMinutes;
  } catch (error) {
    console.error('[AUTH_SERVICE] Error checking token refresh:', error);
    return false;
  }
};

// Refresh token if needed
const refreshTokenIfNeeded = async (): Promise<boolean> => {
  if (needsTokenRefresh()) {
    try {
      const refreshToken = authManager.getRefreshToken();
      if (!refreshToken) return false;
      
      const response = await enhancedApiClient.post<LoginResponse>('/auth/refresh', { refreshToken });
      
      if (response.token) {
        authManager.storeToken(response.token);
        if (response.expiry) {
          authManager.storeTokenExpiry(response.expiry);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('[AUTH_SERVICE] Token refresh error:', error);
      authManager.clearAuthData(); // Clear invalid auth data
      return false;
    }
  }
  
  return true;
};

// Check authentication state
const checkAuthState = (): boolean => {
  const token = authManager.getToken();
  return !!token && !authManager.isTokenExpired();
};

// Get current user
const getCurrentUser = (): UserResponse | null => {
  return authManager.getUser();
};

// Logout function
const logout = (): void => {
  authManager.clearAuthData();
  
  // Emit logout event for components to react
  const logoutEvent = new CustomEvent('auth-logout');
  window.dispatchEvent(logoutEvent);
};

// Check if user has specific role
const hasRole = (role: UserRole | UserRole[]): boolean => {
  return authManager.hasRole(role);
};

// Check if user has specific permission
const hasPermission = (permission: Permission): boolean => {
  return authManager.hasPermission(permission);
};

// Export the service
export const authService = {
  login,
  logout,
  checkAuthState,
  getCurrentUser,
  needsTokenRefresh,
  refreshTokenIfNeeded,
  hasRole,
  hasPermission
};

// Default export for backward compatibility
export default authService;
