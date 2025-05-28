// src/services/authManager.ts

// Debug flag to enable detailed logging
const DEBUG = true;

// Auth manager for token and user storage
export const authManager = {
  // Store token in localStorage and sessionStorage
  storeToken: (token: string) => {
    if (DEBUG) {
      console.log('[AUTH] Storing token');
    }
    
    try {
      localStorage.setItem('auth_token', token);
      sessionStorage.setItem('auth_token', token);
      
      // Also store as cookie for additional redundancy
      document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      
      if (DEBUG) {
        console.log('[AUTH] Token stored successfully in multiple locations');
      }
    } catch (error) {
      console.error('[AUTH] Error storing token:', error);
    }
  },
  
  // Get token from storage (try multiple sources)
  getToken: () => {
    try {
      // Try localStorage first
      let token = localStorage.getItem('auth_token');
      
      if (DEBUG) {
        console.log('[AUTH] Token retrieved from localStorage');
      }
      
      // If not in localStorage, try sessionStorage
      if (!token) {
        token = sessionStorage.getItem('auth_token');
        if (token && DEBUG) {
          console.log('[AUTH] Token retrieved from sessionStorage');
        }
      }
      
      // If still not found, try cookies
      if (!token) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'auth_token') {
            token = value;
            if (DEBUG) {
              console.log('[AUTH] Token retrieved from cookies');
            }
            break;
          }
        }
      }
      
      return token;
    } catch (error) {
      console.error('[AUTH] Error getting token:', error);
      return null;
    }
  },
  
  // Store user data in localStorage
  storeUser: (user: any) => {
    if (DEBUG) {
      console.log('[AUTH] Storing user data');
    }
    
    try {
      localStorage.setItem('auth_user', JSON.stringify(user));
      sessionStorage.setItem('auth_user', JSON.stringify(user));
      
      if (DEBUG) {
        console.log('[AUTH] User stored successfully in multiple locations');
      }
    } catch (error) {
      console.error('[AUTH] Error storing user data:', error);
    }
  },
  
  // Get user data from storage
  getUser: () => {
    try {
      // Try localStorage first
      const userStr = localStorage.getItem('auth_user');
      
      if (DEBUG) {
        console.log('[AUTH] User retrieved from localStorage');
      }
      
      // If not in localStorage, try sessionStorage
      if (!userStr) {
        const sessionUserStr = sessionStorage.getItem('auth_user');
        if (sessionUserStr && DEBUG) {
          console.log('[AUTH] User retrieved from sessionStorage');
        }
        return sessionUserStr ? JSON.parse(sessionUserStr) : null;
      }
      
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('[AUTH] Error getting user data:', error);
      return null;
    }
  },
  
  // Store token expiry time
  storeTokenExpiry: (expiryTime: string) => {
    if (DEBUG) {
      console.log('[AUTH] Storing token expiry');
    }
    
    try {
      localStorage.setItem('auth_token_expiry', expiryTime);
      sessionStorage.setItem('auth_token_expiry', expiryTime);
      
      if (DEBUG) {
        console.log('[AUTH] Token expiry stored successfully');
      }
    } catch (error) {
      console.error('[AUTH] Error storing token expiry:', error);
    }
  },
  
  // Get token expiry time
  getTokenExpiry: () => {
    try {
      // Try localStorage first
      let expiry = localStorage.getItem('auth_token_expiry');
      
      if (DEBUG) {
        console.log('[AUTH] Token expiry retrieved from localStorage');
      }
      
      // If not in localStorage, try sessionStorage
      if (!expiry) {
        expiry = sessionStorage.getItem('auth_token_expiry');
        if (expiry && DEBUG) {
          console.log('[AUTH] Token expiry retrieved from sessionStorage');
        }
      }
      
      return expiry;
    } catch (error) {
      console.error('[AUTH] Error getting token expiry:', error);
      return null;
    }
  },
  
  // Check if token is expired
  isTokenExpired: () => {
    try {
      const expiryStr = authManager.getTokenExpiry();
      
      if (!expiryStr) {
        return true;
      }
      
      const expiry = new Date(expiryStr);
      const now = new Date();
      
      if (DEBUG) {
        console.log('[AUTH] Token expiry check:', { 
          valid: expiry > now,
          expires: expiry.toISOString()
        });
      }
      
      return expiry <= now;
    } catch (error) {
      console.error('[AUTH] Error checking token expiry:', error);
      return true;
    }
  },
  
  // Clear all auth data
  clearAuthData: () => {
    if (DEBUG) {
      console.log('[AUTH] Clearing auth data');
    }
    
    try {
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token_expiry');
      
      // Clear sessionStorage
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token_expiry');
      
      // Clear cookies
      document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
      
      if (DEBUG) {
        console.log('[AUTH] Auth data cleared successfully');
      }
    } catch (error) {
      console.error('[AUTH] Error clearing auth data:', error);
    }
  },
  
  // Get auth headers for API requests
  getAuthHeaders: () => {
    const token = authManager.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },
  
  // Check authentication state
  checkAuthState: () => {
    const token = authManager.getToken();
    const isExpired = authManager.isTokenExpired();
    
    if (DEBUG) {
      console.log('[AUTH] Token is valid during auth state check');
    }
    
    return {
      isAuthenticated: !!token && !isExpired,
      token,
      user: authManager.getUser()
    };
  },
  
  // Method aliases for backward compatibility
  setToken: (token: string) => authManager.storeToken(token),
  getUserData: () => authManager.getUser(),
  setUserData: (user: any) => authManager.storeUser(user)
};
