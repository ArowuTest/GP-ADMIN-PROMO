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
    console.log('Token stored successfully');
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
    return localStorage.getItem(TOKEN_KEY);
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
    localStorage.setItem(USER_KEY, JSON.stringify(user));
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
    const userStr = localStorage.getItem(USER_KEY);
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
    return localStorage.getItem(TOKEN_EXPIRY_KEY);
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
  getAuthHeaders
};

export default authManager;
