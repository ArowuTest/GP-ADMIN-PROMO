// src/services/authService.ts
import { enhancedApiClient } from './apiClient';
import { authManager } from './authManager';
import { LoginResponse, UserResponse } from '../types/api';
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
    // Using correct case for 'email' and 'password' to match backend expectations
    const loginPayload = {
      email: credentials.username,
      password: credentials.password
    };
    
    console.log('[AUTH_SERVICE] Login payload:', JSON.stringify(loginPayload));
    
    // Use the enhanced API client for better error handling
    const response = await enhancedApiClient.post<LoginResponse>('/auth/login', loginPayload);
    
    console.log('[AUTH_SERVICE] Login successful, response:', JSON.stringify(response));
    
    // Store authentication data
    if (response && response.token) {
      // Store token with validation
      authManager.storeToken(response.token);
      console.log('[AUTH_SERVICE] Token stored successfully');
      
      // Store user data
      if (response.user) {
        authManager.storeUser(response.user);
        console.log('[AUTH_SERVICE] User data stored successfully');
      }
      
      // Store credentials for potential re-login if needed
      authManager.storeCredentials(credentials);
      console.log('[AUTH_SERVICE] Credentials stored for potential re-login');
      
      // Handle token expiry
      if (response.expiry) {
        authManager.storeTokenExpiry(response.expiry);
        console.log('[AUTH_SERVICE] Token expiry stored:', response.expiry);
      } else {
        // If no expiry provided, set default expiry to 24 hours from now
        const defaultExpiry = new Date();
        defaultExpiry.setHours(defaultExpiry.getHours() + 24);
        authManager.storeTokenExpiry(defaultExpiry.toISOString());
        console.log('[AUTH_SERVICE] Default token expiry set to 24 hours from now');
      }
      
      // Store refresh token if available
      if (response.refreshToken) {
        authManager.storeRefreshToken(response.refreshToken);
        console.log('[AUTH_SERVICE] Refresh token stored successfully');
      }
      
      // Verify token was stored correctly
      const storedToken = authManager.getToken();
      if (!storedToken) {
        console.error('[AUTH_SERVICE] Token storage verification failed');
        throw new Error('Token storage verification failed');
      }
      
      // Emit auth success event
      const authSuccessEvent = new CustomEvent('auth-success');
      window.dispatchEvent(authSuccessEvent);
    } else {
      console.error('[AUTH_SERVICE] Login response missing token:', JSON.stringify(response));
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
  if (!expiryTime) {
    console.log('[AUTH_SERVICE] No token expiry found, refresh needed');
    return true;
  }
  
  try {
    const expiryDate = new Date(expiryTime);
    const now = new Date();
    
    // Check if token expires within 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    const timeRemaining = expiryDate.getTime() - now.getTime();
    const needsRefresh = timeRemaining < fiveMinutes;
    
    console.log(`[AUTH_SERVICE] Token expires in ${timeRemaining / 1000} seconds, refresh needed: ${needsRefresh}`);
    return needsRefresh;
  } catch (error) {
    console.error('[AUTH_SERVICE] Error checking token refresh:', error);
    return true;
  }
};

// Refresh token if needed
const refreshTokenIfNeeded = async (): Promise<boolean> => {
  // First check if we actually need to refresh
  if (!needsTokenRefresh()) {
    console.log('[AUTH_SERVICE] Token is still valid, no refresh needed');
    return true;
  }
  
  console.log('[AUTH_SERVICE] Token refresh needed, starting refresh process');
  
  try {
    // Option 1: Try to use the refresh token if available
    const refreshToken = authManager.getRefreshToken();
    if (refreshToken) {
      try {
        console.log('[AUTH_SERVICE] Attempting to refresh token with refresh token');
        
        // Create a temporary axios instance for the refresh request
        // This avoids the token interceptor which would cause circular dependencies
        const tempApiClient = enhancedApiClient.createTempClient();
        
        // Use the correct payload format for token refresh
        const refreshPayload = { token: refreshToken };
        console.log('[AUTH_SERVICE] Refresh payload:', JSON.stringify(refreshPayload));
        
        const response = await tempApiClient.post('/auth/refresh', refreshPayload);
        
        console.log('[AUTH_SERVICE] Refresh response:', JSON.stringify(response));
        
        if (response && response.data && response.data.token) {
          // Clear existing token first
          authManager.storeToken('');
          
          // Store new token
          authManager.storeToken(response.data.token);
          console.log('[AUTH_SERVICE] New token stored after refresh');
          
          // Update expiry
          if (response.data.expiry) {
            authManager.storeTokenExpiry(response.data.expiry);
            console.log('[AUTH_SERVICE] New token expiry stored:', response.data.expiry);
          } else {
            // If no expiry provided, set default expiry to 24 hours from now
            const defaultExpiry = new Date();
            defaultExpiry.setHours(defaultExpiry.getHours() + 24);
            authManager.storeTokenExpiry(defaultExpiry.toISOString());
            console.log('[AUTH_SERVICE] Default token expiry set to 24 hours from now');
          }
          
          // Update refresh token if provided
          if (response.data.refreshToken) {
            authManager.storeRefreshToken(response.data.refreshToken);
            console.log('[AUTH_SERVICE] New refresh token stored');
          }
          
          // Verify token was stored correctly
          const storedToken = authManager.getToken();
          if (!storedToken) {
            console.error('[AUTH_SERVICE] Token storage verification failed after refresh');
            throw new Error('Token storage verification failed after refresh');
          }
          
          console.log('[AUTH_SERVICE] Token refreshed successfully');
          
          // Emit auth refresh success event
          const authRefreshEvent = new CustomEvent('auth-refresh-success');
          window.dispatchEvent(authRefreshEvent);
          
          return true;
        } else {
          console.error('[AUTH_SERVICE] Refresh response missing token:', JSON.stringify(response));
          throw new Error('Invalid refresh response: missing token');
        }
      } catch (error) {
        console.warn('[AUTH_SERVICE] Token refresh failed, will try re-login:', error);
      }
    } else {
      console.log('[AUTH_SERVICE] No refresh token available, skipping refresh attempt');
    }
    
    // Option 2: If refresh token is not available or refresh failed,
    // try to re-login with stored credentials if available
    const storedCredentials = authManager.getStoredCredentials();
    if (storedCredentials) {
      try {
        console.log('[AUTH_SERVICE] Attempting re-login with stored credentials');
        
        // Clear existing auth data before re-login
        authManager.clearAuthData();
        
        const response = await login(storedCredentials);
        if (response && response.token) {
          console.log('[AUTH_SERVICE] Re-login successful');
          return true;
        } else {
          console.error('[AUTH_SERVICE] Re-login response missing token');
          throw new Error('Invalid re-login response: missing token');
        }
      } catch (error) {
        console.error('[AUTH_SERVICE] Re-login failed:', error);
      }
    } else {
      console.log('[AUTH_SERVICE] No stored credentials available for re-login');
    }
    
    // If all refresh attempts fail, clear auth data and return false
    console.error('[AUTH_SERVICE] All token refresh attempts failed');
    authManager.clearAuthData();
    
    // Emit auth error event
    const authErrorEvent = new CustomEvent('auth-error', {
      detail: { status: 401, message: 'Authentication failed after all refresh attempts' }
    });
    window.dispatchEvent(authErrorEvent);
    
    return false;
  } catch (error) {
    console.error('[AUTH_SERVICE] Token refresh error:', error);
    authManager.clearAuthData();
    
    // Emit auth error event
    const authErrorEvent = new CustomEvent('auth-error', {
      detail: { status: 401, message: 'Authentication failed with error' }
    });
    window.dispatchEvent(authErrorEvent);
    
    return false;
  }
};

// Check authentication state
const checkAuthState = (): boolean => {
  const token = authManager.getToken();
  const isValid = !!token && !authManager.isTokenExpired();
  console.log(`[AUTH_SERVICE] Auth state check: token exists=${!!token}, not expired=${!authManager.isTokenExpired()}, valid=${isValid}`);
  return isValid;
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
  console.log('[AUTH_SERVICE] Logging out, clearing auth data');
  authManager.clearAuthData();
  
  // Emit logout event for components to react
  const logoutEvent = new CustomEvent('auth-logout');
  window.dispatchEvent(logoutEvent);
  
  console.log('[AUTH_SERVICE] Logout complete');
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
