// src/services/authService.ts
import { apiClient } from './apiClient';
import { authManager } from './authManager';

// Define the login response interface based on actual backend response
interface LoginResponse {
  // The backend might return different structure than what we initially expected
  // We need to adapt to what the backend actually returns
  token?: string;
  user?: any;
  // Add other possible fields based on actual backend response
  auth_token?: string;
  user_data?: any;
  data?: {
    token?: string;
    user?: any;
  };
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
    const response = await apiClient.post<LoginResponse>('/auth/login', loginPayload);
    
    console.log('Received successful response from /auth/login');
    
    // Extract token and user data from response, handling different possible response structures
    let token = null;
    let userData = null;
    
    if (response.data) {
      // Try to extract token from various possible locations in the response
      token = response.data.token || 
              response.data.auth_token || 
              (response.data.data && response.data.data.token) ||
              response.headers['authorization']?.replace('Bearer ', '');
              
      // Try to extract user data from various possible locations in the response
      userData = response.data.user || 
                response.data.user_data || 
                (response.data.data && response.data.data.user) ||
                { 
                  // Create minimal user object if not provided by backend
                  id: response.data.user_id || 'unknown',
                  username: credentials.username || credentials.email || 'unknown',
                  email: credentials.email || credentials.username || 'unknown',
                  role: response.data.role || 'WINNER_REPORTS_USER', // Default role
                  isActive: true
                };
    }
    
    if (token) {
      // Store authentication data
      authManager.storeToken(token);
      authManager.storeUser(userData);
      
      // Calculate and store token expiry (assuming 24 hour expiry)
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 24);
      authManager.storeTokenExpiry(expiryTime.toISOString());
      
      return {
        token: token,
        user: userData
      };
    } else {
      console.error('Response data:', response.data);
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
