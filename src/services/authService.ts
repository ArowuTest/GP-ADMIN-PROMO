// src/services/authService.ts
import { apiClient } from './apiClient';
import { authManager } from './authManager';

/**
 * Login user with credentials
 * @param credentials User credentials (username/email and password)
 * @returns Promise with login response
 */
const login = async (credentials: any): Promise<any> => {
  try {
    console.log('Attempting login...');
    
    // Transform credentials to match backend expectations
    // No validation - let the backend handle validation
    const loginPayload = {
      Email: credentials.username || credentials.email || '',
      Password: credentials.password || '',
    };
    
    console.log('Making POST request to /auth/login');
    // Make login request
    const response = await apiClient.post('/auth/login', loginPayload);
    
    console.log('Received successful response from /auth/login');
    console.log('Response data structure:', JSON.stringify(response.data));
    
    // Handle different possible response structures
    let token = null;
    let user = null;
    
    // Case 1: Standard nested structure { success: true, data: { token, user } }
    if (response.data && response.data.data) {
      if (response.data.data.token) {
        token = response.data.data.token;
      }
      if (response.data.data.user) {
        user = response.data.data.user;
      }
    }
    
    // Case 2: Direct structure { token, user }
    if (!token && response.data && response.data.token) {
      token = response.data.token;
    }
    if (!user && response.data && response.data.user) {
      user = response.data.user;
    }
    
    // Case 3: Token in headers
    if (!token && response.headers && response.headers.authorization) {
      const authHeader = response.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        token = authHeader;
      }
    }
    
    // If we have a token but no user, create a minimal user object
    if (token && !user) {
      // Extract user info from JWT if possible
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        user = {
          ID: payload.sub || payload.id || 'unknown',
          email: payload.email || credentials.email || credentials.username || '',
          username: payload.username || credentials.username || credentials.email || '',
          role: payload.role || 'ADMIN' // Default role
        };
      } catch (e) {
        // If JWT parsing fails, create minimal user object
        user = {
          ID: 'unknown',
          email: credentials.email || credentials.username || '',
          username: credentials.username || credentials.email || '',
          role: 'ADMIN' // Default role
        };
      }
    }
    
    // If we have both token and user, store them and return
    if (token && user) {
      console.log('Successfully extracted token and user from response');
      
      // Store authentication data
      authManager.storeToken(token);
      authManager.storeUser(user);
      
      // Default expiry (24 hours)
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 24);
      authManager.storeTokenExpiry(expiryTime.toISOString());
      
      return {
        token: token,
        user: user
      };
    }
    
    console.error('Failed to extract token and user from response:', response.data);
    throw new Error('Invalid login response: missing token or user data');
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Extract and throw meaningful error message
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Login failed');
    }
    throw error;
  }
};

/**
 * Logout user
 */
const logout = (): void => {
  authManager.clearAuthData();
};

/**
 * Validate token with backend (only if endpoint exists)
 * @param token JWT token to validate
 * @returns Promise resolving to boolean indicating if token is valid
 */
const validateToken = async (token: string): Promise<boolean> => {
  try {
    // Check token locally first
    if (!token) return false;
    
    // Skip backend validation since endpoint doesn't exist
    // Instead, rely on local expiry check
    return !authManager.isTokenExpired();
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const authService = {
  login,
  logout,
  validateToken
};

export default authService;
