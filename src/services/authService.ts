// src/services/authService.ts
import { apiClient } from './apiClient';
import { authManager } from './authManager';

// Define the login response interface
interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

// Define the login credentials interface to match backend expectations
interface LoginCredentials {
  Email: string;    // Capitalized to match backend expectations
  Password: string; // Capitalized to match backend expectations
}

/**
 * Login user with credentials
 * @param credentials User credentials (username/email and password)
 * @returns Promise with login response
 */
const login = async (credentials: any): Promise<LoginResponse> => {
  try {
    console.log('Attempting login...');
    
    // Transform credentials to match backend expectations
    const loginPayload: LoginCredentials = {
      Email: credentials.username || credentials.email || '',
      Password: credentials.password || '',
    };
    
    // Make login request
    const response = await apiClient.post<LoginResponse>('/auth/login', loginPayload);
    
    if (response.data && response.data.token) {
      // Store authentication data
      authManager.storeToken(response.data.token);
      authManager.storeUser(response.data.user);
      
      // Calculate and store token expiry (assuming 24 hour expiry)
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 24);
      authManager.storeTokenExpiry(expiryTime.toISOString());
      
      return response.data;
    } else {
      throw new Error('Invalid login response: missing token or user data');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Extract and throw meaningful error message
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Login failed');
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
    
    // If backend endpoint is added later, uncomment this code:
    /*
    const response = await apiClient.post('/auth/validate-token', { token });
    return response.data.valid || false;
    */
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
