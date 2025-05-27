// src/services/authService.ts
import axios from 'axios';
import { authManager } from './authManager';

// Base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://gp-backend-promo.onrender.com/api/v1';

// Debug flag to enable detailed logging
const DEBUG = true;

/**
 * Comprehensive authentication service with robust error handling
 * and support for various backend response formats
 */
export const authService = {
  /**
   * Login user with email and password
   * Handles multiple response formats and provides detailed error logging
   */
  login: async (email: string, password: string) => {
    try {
      if (DEBUG) {
        console.log('[AUTH] Login attempt:', { email, hasPassword: !!password });
      }

      // Check if we already have a valid token
      const existingToken = authManager.getToken();
      if (existingToken) {
        if (DEBUG) {
          console.log('[AUTH] Existing token found, validating...');
        }
        
        try {
          // CORS FIX: Use modified axios config for cross-origin requests
          const validateResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: {
              'Authorization': `Bearer ${existingToken}`,
              'X-Auth-Token': existingToken, // Add custom header as fallback
              'Content-Type': 'application/json'
            },
            withCredentials: false // Changed from true to false for cross-origin
          });
          
          if (validateResponse.status === 200) {
            if (DEBUG) {
              console.log('[AUTH] Existing token is valid, using cached user data');
            }
            
            // Use existing token and user data
            return {
              success: true,
              token: existingToken,
              user: authManager.getUser() || { email }
            };
          }
        } catch (validateError) {
          if (DEBUG) {
            console.warn('[AUTH] Existing token validation failed, proceeding with login', validateError);
          }
          // Continue with login if token validation fails
        }
      }

      // CORS FIX: Use modified axios config for cross-origin login requests
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: false // Changed from true to false for cross-origin
      });

      if (DEBUG) {
        console.log('[AUTH] Login response:', {
          status: response.status,
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : []
        });
      }

      // Handle successful response
      if (response.status === 200) {
        // Extract token from various possible response formats
        let token = null;
        let userData = null;

        // Check response headers first (some APIs return token in header)
        const authHeader = response.headers['authorization'] || response.headers['Authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
          if (DEBUG) console.log('[AUTH] Token found in Authorization header');
        }

        // Check response data for token
        if (!token && response.data) {
          // Format 1: { token: "..." }
          if (response.data.token) {
            token = response.data.token;
            if (DEBUG) console.log('[AUTH] Token found in response.data.token');
          }
          // Format 2: { data: { token: "..." } }
          else if (response.data.data && response.data.data.token) {
            token = response.data.data.token;
            if (DEBUG) console.log('[AUTH] Token found in response.data.data.token');
          }
          // Format 3: { access_token: "..." }
          else if (response.data.access_token) {
            token = response.data.access_token;
            if (DEBUG) console.log('[AUTH] Token found in response.data.access_token');
          }
          // Format 4: { data: { access_token: "..." } }
          else if (response.data.data && response.data.data.access_token) {
            token = response.data.data.access_token;
            if (DEBUG) console.log('[AUTH] Token found in response.data.data.access_token');
          }
          
          // Extract user data from various possible formats
          if (response.data.user) {
            userData = response.data.user;
            if (DEBUG) console.log('[AUTH] User data found in response.data.user');
          }
          else if (response.data.data && response.data.data.user) {
            userData = response.data.data.user;
            if (DEBUG) console.log('[AUTH] User data found in response.data.data.user');
          }
          else if (response.data.userData) {
            userData = response.data.userData;
            if (DEBUG) console.log('[AUTH] User data found in response.data.userData');
          }
          else if (response.data.data && response.data.data.userData) {
            userData = response.data.data.userData;
            if (DEBUG) console.log('[AUTH] User data found in response.data.data.userData');
          }
          // If we have a token but no user data, create minimal user object
          else if (token) {
            userData = { email };
            if (DEBUG) console.log('[AUTH] Created minimal user data with email');
          }
        }

        // If we have a token, store it and return success
        if (token) {
          if (DEBUG) {
            console.log('[AUTH] Login successful, storing token and user data');
          }
          
          // Store token in multiple storage mechanisms for redundancy
          authManager.storeToken(token);
          
          // Store user data
          if (userData) {
            authManager.storeUser(userData);
          }
          
          // Set token expiry to 7 days from now
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 7);
          authManager.storeTokenExpiry(expiryDate.toISOString());
          
          return {
            success: true,
            token,
            user: userData
          };
        }
        
        // If we got a 200 response but couldn't find a token, log the entire response for debugging
        if (DEBUG) {
          console.warn('[AUTH] Login response was 200 but no token found:', response.data);
        }
        
        return {
          success: false,
          error: 'Invalid login response: missing token or user data'
        };
      }
      
      // Handle unexpected success status
      return {
        success: false,
        error: `Unexpected response status: ${response.status}`
      };
    } catch (error: any) {
      if (DEBUG) {
        console.error('[AUTH] Login error:', error);
      }
      
      // Handle specific error cases
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          error: error.response.data?.message || `Server error: ${error.response.status}`,
          status: error.response.status
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'No response from server. Please check your connection.'
        };
      } else {
        // Error in setting up the request
        return {
          success: false,
          error: error.message || 'Unknown error occurred'
        };
      }
    }
  },

  /**
   * Logout user and clear all authentication data
   */
  logout: () => {
    if (DEBUG) {
      console.log('[AUTH] Logging out, clearing all auth data');
    }
    
    // Clear auth data from all storage mechanisms
    authManager.clearAuthData();
    
    // Redirect to login page
    window.location.href = '/login';
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = authManager.getToken();
    
    if (DEBUG && token) {
      console.log('[AUTH] Authentication check: Token found');
    }
    
    return !!token;
  }
};

export default authService;
