// src/services/authService.ts - TypeScript Interface
import { apiClient } from './apiClient';
import { authManager } from './authManager';

// Define the backend response structure based on actual backend code
interface BackendLoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: {
      ID: string;
      username: string;
      email: string;
      role: string;
      isActive: boolean;
      fullName?: string;
      createdAt?: string;
      updatedAt?: string;
    };
    expiry: string;
  };
  error?: string;
}

/**
 * Login user with credentials
 * @param credentials User credentials (username/email and password)
 * @returns Promise with login response
 */
const login = async (credentials: any): Promise<any> => {
  try {
    console.log('Attempting login...');
    
    // Transform credentials to match backend expectations
    const loginPayload = {
      Email: credentials.username || credentials.email || '',
      Password: credentials.password || '',
    };
    
    console.log('Making POST request to /auth/login');
    // Make login request
    const response = await apiClient.post<BackendLoginResponse>('/auth/login', loginPayload);
    
    console.log('Received successful response from /auth/login');
    
    // Extract token and user data from the correct location in the response
    // Backend returns: { success: true, data: { token: "...", user: {...}, expiry: "..." } }
    if (response.data && response.data.data) {
      const loginData = response.data.data;
      
      if (loginData.token && loginData.user) {
        // Store authentication data
        authManager.storeToken(loginData.token);
        authManager.storeUser(loginData.user);
        
        // Calculate and store token expiry
        if (loginData.expiry) {
          authManager.storeTokenExpiry(loginData.expiry);
        } else {
          // Default expiry if not provided (24 hours)
          const expiryTime = new Date();
          expiryTime.setHours(expiryTime.getHours() + 24);
          authManager.storeTokenExpiry(expiryTime.toISOString());
        }
        
        return {
          token: loginData.token,
          user: loginData.user
        };
      }
    }
    
    console.error('Response data:', response.data);
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
