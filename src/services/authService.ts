// src/services/authService.ts
import axios from 'axios';
import { authManager } from './authManager';

// Debug flag to enable detailed logging
const DEBUG = true;

// API base URL - update this to match your backend URL
const API_BASE_URL = 'https://gp-backend-promo.onrender.com/api/v1';

// Authentication service with improved login flow
export const authService = {
  // Login function with email and password
  login: async (email: string, password: string ) => {
    if (DEBUG) {
      console.log('[AUTH] Login attempt:', { email, hasPassword: !!password });
    }

    // Check if we already have a valid token
    const existingToken = authManager.getToken();
    if (existingToken) {
      if (DEBUG) {
        console.log('[AUTH] Existing token found, but skipping validation to avoid 401 errors');
      }
      
      // CRITICAL FIX: Skip token validation against /admin/users endpoint
      // This prevents 401 errors during login process
      // Instead, we'll proceed with login to get a fresh token
    }

    try {
      // Proceed with login request
      const loginResponse = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: false // Changed from true to false for cross-origin
        }
      );

      if (DEBUG) {
        console.log('[AUTH] Login response:', {
          status: loginResponse.status,
          hasData: !!loginResponse.data,
          dataKeys: loginResponse.data ? Object.keys(loginResponse.data) : []
        });
      }

      // Extract token from response
      let token = null;
      let user = null;

      // Check for token in different response formats
      if (loginResponse.data) {
        // Format 1: { token: "..." }
        if (loginResponse.data.token) {
          if (DEBUG) {
            console.log('[AUTH] Token found in response.data.token');
          }
          token = loginResponse.data.token;
        }
        // Format 2: { data: { token: "..." } }
        else if (loginResponse.data.data && loginResponse.data.data.token) {
          if (DEBUG) {
            console.log('[AUTH] Token found in response.data.data.token');
          }
          token = loginResponse.data.data.token;
        }
        // Format 3: { data: { data: { token: "..." } } }
        else if (
          loginResponse.data.data &&
          loginResponse.data.data.data &&
          loginResponse.data.data.data.token
        ) {
          if (DEBUG) {
            console.log('[AUTH] Token found in response.data.data.data.token');
          }
          token = loginResponse.data.data.data.token;
        }

        // Check for user data in different response formats
        // Format 1: { user: {...} }
        if (loginResponse.data.user) {
          if (DEBUG) {
            console.log('[AUTH] User data found in response.data.user');
          }
          user = loginResponse.data.user;
        }
        // Format 2: { data: { user: {...} } }
        else if (loginResponse.data.data && loginResponse.data.data.user) {
          if (DEBUG) {
            console.log('[AUTH] User data found in response.data.data.user');
          }
          user = loginResponse.data.data.user;
        }
        // Format 3: { data: { data: { user: {...} } } }
        else if (
          loginResponse.data.data &&
          loginResponse.data.data.data &&
          loginResponse.data.data.data.user
        ) {
          if (DEBUG) {
            console.log('[AUTH] User data found in response.data.data.data.user');
          }
          user = loginResponse.data.data.data.user;
        }
      }

      // Check if we found a token and user
      if (token && user) {
        if (DEBUG) {
          console.log('[AUTH] Login successful, storing token and user data');
        }

        // Store token and user data
        authManager.storeToken(token);
        authManager.storeUser(user);

        // Calculate token expiry (default: 7 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        authManager.storeTokenExpiry(expiryDate.toISOString());

        return {
          success: true,
          token,
          user
        };
      } else {
        if (DEBUG) {
          console.error('[AUTH] Login failed: Token or user data not found in response');
        }
        return {
          success: false,
          error: 'Authentication failed. Please try again.'
        };
      }
    } catch (error: any) {
      console.error('[AUTH] Login error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed. Please try again.'
      };
    }
  },

  // Logout function
  logout: () => {
    if (DEBUG) {
      console.log('[AUTH] Logging out');
    }
    authManager.clearAuthData();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = authManager.getToken();
    const isExpired = authManager.isTokenExpired();
    
    if (DEBUG) {
      console.log('[AUTH] Checking authentication:', { 
        hasToken: !!token, 
        isExpired: isExpired 
      });
    }
    
    return !!token && !isExpired;
  }
};
