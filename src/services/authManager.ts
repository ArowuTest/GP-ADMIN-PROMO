// src/services/authManager.ts
/**
 * AuthManager - Centralized authentication token management
 * 
 * This module provides a single source of truth for all authentication token operations,
 * ensuring consistent token storage, retrieval, and validation across the application.
 */

// Constants
const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';

/**
 * Store authentication token
 * @param token JWT token string
 */
export const storeToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    console.log('Token stored successfully in localStorage');
    
    // Also store in sessionStorage as backup
    sessionStorage.setItem(TOKEN_KEY, token);
    console.log('Token stored successfully in sessionStorage');
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

/**
 * Retrieve authentication token
 * @returns The stored token or null if not found
 */
export const getToken = (): string | null => {
  try {
    // Try localStorage first
    let token = localStorage.getItem(TOKEN_KEY);
    
    // If not in localStorage, try sessionStorage
    if (!token) {
      token = sessionStorage.getItem(TOKEN_KEY);
      if (token) {
        console.log('Token retrieved from sessionStorage');
        // Restore to localStorage if found in sessionStorage
        localStorage.setItem(TOKEN_KEY, token);
      }
    } else {
      console.log('Token retrieved from localStorage');
    }
    
    return token;
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
};

/**
 * Store user information
 * @param user User object
 */
export const storeUser = (user: any): void => {
  try {
    const userStr = JSON.stringify(user);
    localStorage.setItem(USER_KEY, userStr);
    console.log('User stored successfully in localStorage');
    
    // Also store in sessionStorage as backup
    sessionStorage.setItem(USER_KEY, userStr);
    console.log('User stored successfully in sessionStorage');
  } catch (error) {
    console.error('Failed to store user:', error);
  }
};

/**
 * Retrieve user information
 * @returns The stored user object or null if not found
 */
export const getUser = (): any | null => {
  try {
    // Try localStorage first
    let userStr = localStorage.getItem(USER_KEY);
    
    // If not in localStorage, try sessionStorage
    if (!userStr) {
      userStr = sessionStorage.getItem(USER_KEY);
      if (userStr) {
        console.log('User retrieved from sessionStorage');
        // Restore to localStorage if found in sessionStorage
        localStorage.setItem(USER_KEY, userStr);
      }
    } else {
      console.log('User retrieved from localStorage');
    }
    
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to retrieve user:', error);
    return null;
  }
};

/**
 * Store token expiration time
 * @param expiryTime Expiration time string (ISO format)
 */
export const storeTokenExpiry = (expiryTime: string): void => {
  try {
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime);
    
    // Also store in sessionStorage as backup
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime);
  } catch (error) {
    console.error('Failed to store token expiry:', error);
  }
};

/**
 * Retrieve token expiration time
 * @returns The stored expiry time or null if not found
 */
export const getTokenExpiry = (): string | null => {
  try {
    // Try localStorage first
    let expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    // If not in localStorage, try sessionStorage
    if (!expiryStr) {
      expiryStr = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
      if (expiryStr) {
        // Restore to localStorage if found in sessionStorage
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryStr);
      }
    }
    
    return expiryStr;
  } catch (error) {
    console.error('Failed to retrieve token expiry:', error);
    return null;
  }
};

/**
 * Check if the token is expired
 * @returns True if token is expired or not found, false otherwise
 */
export const isTokenExpired = (): boolean => {
  try {
    const expiryStr = getTokenExpiry();
    if (!expiryStr) return true;
    
    const expiryTime = new Date(expiryStr).getTime();
    const currentTime = new Date().getTime();
    
    return currentTime >= expiryTime;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    
    console.log('Auth data cleared from both localStorage and sessionStorage');
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
};

/**
 * Get authorization headers for API requests
 * @returns Authorization headers object or empty object if no token
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Check authentication state on page load/navigation
 * @returns Promise resolving to boolean indicating if user is authenticated
 */
export const checkAuthState = async (): Promise<boolean> => {
  const token = getToken();
  if (!token) {
    console.log('No token found during auth state check');
    return false;
  }
  
  // Check if token is expired based on stored expiry
  if (isTokenExpired()) {
    console.log('Token is expired during auth state check');
    clearAuthData();
    return false;
  }
  
  console.log('Token is valid during auth state check');
  // Skip backend validation since endpoint doesn't exist
  // Instead, rely on local expiry check
  return true;
};

// Export as a named object for convenience
export const authManager = {
  storeToken,
  getToken,
  storeUser,
  getUser,
  storeTokenExpiry,
  getTokenExpiry,
  isTokenExpired,
  clearAuthData,
  getAuthHeaders,
  checkAuthState
};

export default authManager;
