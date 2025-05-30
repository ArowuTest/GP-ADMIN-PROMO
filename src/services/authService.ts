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
    // Using lowercase 'email' and 'password' to match backend expectations
    const loginPayload: any = {
      email: credentials.username,
      password: credentials.password
    };
    
    // Use the enhanced API client for better error handling
    const response = await enhancedApiClient.post<LoginResponse>('/auth/login', loginPayload);
    
    console.log('[AUTH_SERVICE] Login successful');
    
    // Store authentication data
    if (response.token) {
      authManager.storeToken(response.token);
      authManager.storeUser(response.user);
      
      // Store credentials for potential re-login if "remember me" is checked
      authManager.storeCredentials(credentials);
      
      if (response.expiry) {
        authManager.storeTokenExpiry(response.expiry);
      } else {
        // If no expiry provided, set default expiry to 24 hours from now
        const defaultExpiry = new Date();
        defaultExpiry.setHours(defaultExpiry.getHours() + 24);
        authManager.storeTokenExpiry(defaultExpiry.toISOString());
      }
      if (response.refreshToken) {
        authManager.storeRefreshToken(response.refreshToken);
      }
    } else {
      console.error('[AUTH_SERVICE] Login response missing token');
      throw new Error('Invalid login response: missing token');
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
  if (!expiryTime) return true;
  
  try {
    const expiryDate = new Date(expiryTime);
    const now = new Date();
    
    // Check if token expires within 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    return expiryDate.getTime() - now.getTime() < fiveMinutes;
  } catch (error) {
    console.error('[AUTH_SERVICE] Error checking token refresh:', error);
    return true;
  }
};

// Refresh token if needed
const refreshTokenIfNeeded = async (): Promise<boolean> => {
  if (!needsTokenRefresh()) {
    // Token is still valid, no need to refresh
    return true;
  }
  
  try {
    // For now, we'll implement a workaround since the backend refresh endpoint
    // may not be fully implemented yet
    
    // Option 1: Try to use the refresh token if available
    const refreshToken = authManager.getRefreshToken();
    if (refreshToken) {
      try {
        console.log('[AUTH_SERVICE] Attempting to refresh token');
        // Use the correct payload format for token refresh
        const response = await enhancedApiClient.post<LoginResponse>('/auth/refresh', { token: refreshToken });
        
        if (response && response.token) {
          authManager.storeToken(response.token);
          if (response.expiry) {
            authManager.storeTokenExpiry(response.expiry);
          } else {
            // If no expiry provided, set default expiry to 24 hours from now
            const defaultExpiry = new Date();
            defaultExpiry.setHours(defaultExpiry.getHours() + 24);
            authManager.storeTokenExpiry(defaultExpiry.toISOString());
          }
          if (response.refreshToken) {
            authManager.storeRefreshToken(response.refreshToken);
          }
          console.log('[AUTH_SERVICE] Token refreshed successfully');
          return true;
        }
      } catch (error) {
        console.warn('[AUTH_SERVICE] Token refresh failed, will try re-login:', error);
      }
    }
    
    // Option 2: If refresh token is not available or refresh failed,
    // try to re-login with stored credentials if available
    const storedCredentials = authManager.getStoredCredentials();
    if (storedCredentials) {
      try {
        console.log('[AUTH_SERVICE] Attempting re-login with stored credentials');
        const response = await login(storedCredentials);
        if (response && response.token) {
          console.log('[AUTH_SERVICE] Re-login successful');
          return true;
        }
      } catch (error) {
        console.error('[AUTH_SERVICE] Re-login failed:', error);
      }
    }
    
    // If all refresh attempts fail, clear auth data and return false
    console.error('[AUTH_SERVICE] All token refresh attempts failed');
    authManager.clearAuthData();
    return false;
  } catch (error) {
    console.error('[AUTH_SERVICE] Token refresh error:', error);
    authManager.clearAuthData();
    return false;
  }
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

// Get current token
const getToken = (): string | null => {
  return authManager.getToken();
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
  getToken,
  needsTokenRefresh,
  refreshTokenIfNeeded,
  hasRole,
  hasPermission
};

// Default export for backward compatibility
export default authService;
