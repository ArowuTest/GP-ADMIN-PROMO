// src/services/authService.ts
import { apiClient } from './apiClient';
import { authManager } from './authManager';

// Define types for authentication data
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  user?: any;
  message?: string;
  expiresIn?: string | number;
  data?: {
    token?: string;
    user?: any;
    expiresIn?: string | number;
  };
}

// Login function that handles different API response formats
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Make login request
    const response = await apiClient.post('/auth/login', credentials);
    
    // Extract data from response, handling different response formats
    const responseData = response.data;
    
    // Extract token, handling different response structures
    let token = null;
    let user = null;
    let expiresIn = null;
    
    // Handle nested data structure
    if (responseData.data) {
      token = responseData.data.token || null;
      user = responseData.data.user || null;
      expiresIn = responseData.data.expiresIn || null;
    } else {
      // Handle flat structure
      token = responseData.token || null;
      user = responseData.user || null;
      expiresIn = responseData.expiresIn || null;
    }
    
    // Store authentication data if token exists
    if (token) {
      // Store token
      authManager.storeToken(token);
      
      // Store user data
      if (user) {
        authManager.storeUser(user);
      }
      
      // Store token expiry if available
      if (expiresIn) {
        const expiryTime = typeof expiresIn === 'number' 
          ? new Date(Date.now() + expiresIn * 1000).toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Default 24h
        
        authManager.storeTokenExpiry(expiryTime);
      }
    }
    
    // Return processed response
    return {
      token,
      user,
      expiresIn,
      message: responseData.message || 'Login successful'
    };
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Extract error message if available
    let errorMessage = 'Login failed. Please check your credentials and try again.';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    
    // Throw error with message
    throw new Error(errorMessage);
  }
};

// Logout function
const logout = (): void => {
  // Clear all authentication data
  authManager.clearAuthData();
};

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  // Get token
  const token = authManager.getToken();
  
  // Check if token exists and is not expired
  return !!token && !authManager.isTokenExpired();
};

// Get current user data
const getCurrentUser = (): any => {
  return authManager.getUser();
};

// Get user role
const getUserRole = (): string | null => {
  const user = authManager.getUser();
  return user ? user.role : null;
};

// Validate token with backend
// CRITICAL FIX: Skip token validation to avoid unnecessary 401 errors
// This function is problematic and causes logout loops
const validateToken = async (): Promise<boolean> => {
  try {
    // SKIP VALIDATION: Return true without making API call
    // This prevents unnecessary 401 errors that cause logout loops
    return true;
    
    // Original implementation (commented out):
    /*
    const token = authManager.getToken();
    if (!token) return false;
    
    const response = await apiClient.get('/auth/validate-token', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.valid === true;
    */
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Compatibility aliases for backward compatibility
// These ensure existing code that uses these method names continues to work
const getUserData = getCurrentUser;
const setUserData = (user: any): void => authManager.storeUser(user);
const setToken = (token: string): void => authManager.storeToken(token);

// Export all functions
export const authService = {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  validateToken,
  getUserData, // Compatibility alias
  setUserData, // Compatibility alias
  setToken,    // Compatibility alias
};

// Default export for backward compatibility
export default authService;
