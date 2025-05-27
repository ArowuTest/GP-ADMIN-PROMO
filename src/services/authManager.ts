// src/services/authManager.ts
/**
 * AuthManager - Centralized authentication token management
 * Enhanced version with redundant storage, detailed logging, and aligned method names
 */

// Constants
const TOKEN_KEY = 'token'; // Changed to match what robust_authService expects
const USER_KEY = 'user';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';

// Debug flag to enable detailed logging
const DEBUG = true;

/**
 * Store authentication token with redundancy
 * @param token JWT token string
 */
export const storeToken = (token: string): void => {
  try {
    // Store in both localStorage and sessionStorage for redundancy
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(TOKEN_KEY, token);
    
    // Also set as cookie for additional redundancy
    document.cookie = `auth_token=${token}; path=/; max-age=604800`; // 7 days
    
    if (DEBUG) {
      console.log('[AUTH] Token stored successfully in multiple locations');
    }
  } catch (error) {
    console.error('[AUTH] Failed to store token:', error);
  }
};

/**
 * Retrieve authentication token with fallback mechanisms
 * @returns The stored token or null if not found
 */
export const getToken = (): string | null => {
  try {
    // Try localStorage first
    let token = localStorage.getItem(TOKEN_KEY);
    
    // If not in localStorage, try sessionStorage
    if (!token) {
      token = sessionStorage.getItem(TOKEN_KEY);
      if (token && DEBUG) {
        console.log('[AUTH] Token retrieved from sessionStorage (localStorage fallback)');
      }
    } else if (DEBUG) {
      console.log('[AUTH] Token retrieved from localStorage');
    }
    
    // If still not found, try cookie
    if (!token) {
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];
      
      if (cookieToken) {
        token = cookieToken;
        if (DEBUG) {
          console.log('[AUTH] Token retrieved from cookie (storage fallback)');
        }
        
        // Restore token to storage for future use
        storeToken(token);
      }
    }
    
    return token;
  } catch (error) {
    console.error('[AUTH] Failed to retrieve token:', error);
    return null;
  }
};

/**
 * Store user information with redundancy
 * @param user User object
 */
export const storeUser = (user: any): void => {
  try {
    const userStr = JSON.stringify(user);
    // Store in both localStorage and sessionStorage for redundancy
    localStorage.setItem(USER_KEY, userStr);
    sessionStorage.setItem(USER_KEY, userStr);
    
    if (DEBUG) {
      console.log('[AUTH] User stored successfully in multiple locations');
    }
  } catch (error) {
    console.error('[AUTH] Failed to store user:', error);
  }
};

/**
 * Retrieve user information with fallback mechanisms
 * @returns The stored user object or null if not found
 */
export const getUser = (): any | null => {
  try {
    // Try localStorage first
    let userStr = localStorage.getItem(USER_KEY);
    
    // If not in localStorage, try sessionStorage
    if (!userStr) {
      userStr = sessionStorage.getItem(USER_KEY);
      if (userStr && DEBUG) {
        console.log('[AUTH] User retrieved from sessionStorage (localStorage fallback)');
      }
    } else if (DEBUG) {
      console.log('[AUTH] User retrieved from localStorage');
    }
    
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('[AUTH] Failed to retrieve user:', error);
    return null;
  }
};

/**
 * Store token expiration time with redundancy
 * @param expiryTime Expiration time string (ISO format)
 */
export const storeTokenExpiry = (expiryTime: string): void => {
  try {
    // Store in both localStorage and sessionStorage for redundancy
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime);
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime);
    
    if (DEBUG) {
      console.log('[AUTH] Token expiry stored successfully');
    }
  } catch (error) {
    console.error('[AUTH] Failed to store token expiry:', error);
  }
};

/**
 * Retrieve token expiration time with fallback mechanisms
 * @returns The stored expiry time or null if not found
 */
export const getTokenExpiry = (): string | null => {
  try {
    // Try localStorage first
    let expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    // If not in localStorage, try sessionStorage
    if (!expiryStr) {
      expiryStr = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
      if (expiryStr && DEBUG) {
        console.log('[AUTH] Token expiry retrieved from sessionStorage (localStorage fallback)');
      }
    } else if (DEBUG) {
      console.log('[AUTH] Token expiry retrieved from localStorage');
    }
    
    return expiryStr;
  } catch (error) {
    console.error('[AUTH] Failed to retrieve token expiry:', error);
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
    if (!expiryStr) {
      if (DEBUG) console.log('[AUTH] No token expiry found, considering token expired');
      return true;
    }
    
    const expiryTime = new Date(expiryStr).getTime();
    const currentTime = new Date().getTime();
    const isExpired = currentTime >= expiryTime;
    
    if (DEBUG) {
      console.log(`[AUTH] Token expiry check: ${isExpired ? 'expired' : 'valid'} (expires ${new Date(expiryTime).toISOString()})`);
    }
    
    return isExpired;
  } catch (error) {
    console.error('[AUTH] Error checking token expiry:', error);
    return true;
  }
};

/**
 * Clear all authentication data from all storage mechanisms
 */
export const clearAuthData = (): void => {
  try {
    // Clear from localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    
    // Clear from sessionStorage
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    
    // Clear auth cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    if (DEBUG) {
      console.log('[AUTH] Auth data cleared from all storage locations');
    }
  } catch (error) {
    console.error('[AUTH] Failed to clear auth data:', error);
  }
};

/**
 * Get authorization headers for API requests
 * @returns Authorization headers object or empty object if no token
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  if (DEBUG) {
    console.log(`[AUTH] Token available for request: ${!!token}`);
  }
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Check authentication state on page load/navigation
 * @returns Promise resolving to boolean indicating if user is authenticated
 */
export const checkAuthState = async (): Promise<boolean> => {
  const token = getToken();
  if (!token) {
    if (DEBUG) console.log('[AUTH] No token found during auth state check');
    return false;
  }
  
  // Check if token is expired based on stored expiry
  if (isTokenExpired()) {
    if (DEBUG) console.log('[AUTH] Token is expired during auth state check');
    clearAuthData();
    return false;
  }
  
  if (DEBUG) console.log('[AUTH] Token is valid during auth state check');
  return true;
};

// Method aliases to maintain compatibility with both naming conventions
export const setToken = storeToken;
export const getUserData = getUser;
export const setUserData = storeUser;

// Export as a named object for convenience
export const authManager = {
  // Original methods
  storeToken,
  getToken,
  storeUser,
  getUser,
  storeTokenExpiry,
  getTokenExpiry,
  isTokenExpired,
  clearAuthData,
  getAuthHeaders,
  checkAuthState,
  
  // Alias methods for compatibility
  setToken,
  getUserData,
  setUserData
};

export default authManager;
