// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserResponse } from '../types/api';
import { Permission, UserRole } from '../types/common';

// Define the context shape
interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  refreshToken: () => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  login: async () => {},
  logout: () => {},
  hasPermission: () => false,
  hasRole: () => false,
  refreshToken: async () => false
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Logout function - defined with useCallback to avoid dependency issues
  const logout = useCallback(() => {
    console.log('[AUTH_CONTEXT] Logging out');
    authService.logout();
    setUser(null);
    setToken(null);
    navigate('/login');
  }, [navigate]);

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    console.log('[AUTH_CONTEXT] Attempting to refresh token');
    try {
      const refreshed = await authService.refreshTokenIfNeeded();
      
      if (refreshed) {
        // Update token and user in state
        const newToken = authService.getToken();
        const currentUser = authService.getCurrentUser();
        
        if (newToken) {
          setToken(newToken);
          console.log('[AUTH_CONTEXT] Token refreshed successfully');
          
          // Also update user if available
          if (currentUser) {
            setUser(currentUser);
          }
          
          return true;
        }
      }
      
      console.warn('[AUTH_CONTEXT] Token refresh failed');
      return false;
    } catch (error) {
      console.error('[AUTH_CONTEXT] Token refresh error:', error);
      return false;
    }
  };

  // Check authentication state on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[AUTH_CONTEXT] Checking authentication state');
      try {
        const isAuthenticated = authService.checkAuthState();
        
        if (isAuthenticated) {
          // Get current user from auth manager
          const currentUser = authService.getCurrentUser();
          const currentToken = authService.getToken();
          
          if (currentUser && currentToken) {
            setUser(currentUser);
            setToken(currentToken);
            console.log('[AUTH_CONTEXT] User authenticated:', currentUser.username);
          } else {
            console.warn('[AUTH_CONTEXT] Auth state check: Missing user or token');
            // Force logout if we have inconsistent state
            authService.logout();
          }
        } else {
          console.log('[AUTH_CONTEXT] User not authenticated');
          
          // Try to refresh token if not authenticated
          const refreshed = await refreshToken();
          if (!refreshed) {
            // Clear any stale state
            setUser(null);
            setToken(null);
          }
        }
      } catch (error) {
        console.error('[AUTH_CONTEXT] Auth check error:', error);
        // Clear any stale state
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth error events
    const handleAuthError = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('[AUTH_CONTEXT] Auth error event received:', customEvent.detail);
      
      // Skip refresh for auth endpoints to prevent infinite loops
      if (customEvent.detail && customEvent.detail.url && 
          (customEvent.detail.url.includes('/auth/login') || 
           customEvent.detail.url.includes('/auth/refresh'))) {
        console.log('[AUTH_CONTEXT] Skipping token refresh for auth endpoint');
        return;
      }
      
      console.log('[AUTH_CONTEXT] Attempting token refresh due to auth error');
      refreshToken().catch(() => {
        console.log('[AUTH_CONTEXT] Token refresh failed after auth error, logging out');
        logout();
      });
    };
    
    window.addEventListener('auth-error', handleAuthError);
    
    // Listen for logout events
    const handleLogout = () => {
      console.log('[AUTH_CONTEXT] Logout event received');
      setUser(null);
      setToken(null);
      navigate('/login');
    };
    
    window.addEventListener('auth-logout', handleLogout);
    
    // Listen for auth success events
    const handleAuthSuccess = () => {
      console.log('[AUTH_CONTEXT] Auth success event received, updating state');
      const currentUser = authService.getCurrentUser();
      const currentToken = authService.getToken();
      
      if (currentUser && currentToken) {
        setUser(currentUser);
        setToken(currentToken);
      }
    };
    
    window.addEventListener('auth-success', handleAuthSuccess);
    
    // Listen for auth refresh success events
    const handleAuthRefresh = () => {
      console.log('[AUTH_CONTEXT] Auth refresh success event received, updating state');
      const currentUser = authService.getCurrentUser();
      const currentToken = authService.getToken();
      
      if (currentUser && currentToken) {
        setUser(currentUser);
        setToken(currentToken);
      }
    };
    
    window.addEventListener('auth-refresh-success', handleAuthRefresh);
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
      window.removeEventListener('auth-logout', handleLogout);
      window.removeEventListener('auth-success', handleAuthSuccess);
      window.removeEventListener('auth-refresh-success', handleAuthRefresh);
    };
  }, [logout, navigate]); // Added logout and navigate to dependency array

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('[AUTH_CONTEXT] Attempting login for:', email);
      const response = await authService.login({ username: email, password });
      
      if (response && response.token && response.user) {
        setUser(response.user);
        setToken(response.token);
        console.log('[AUTH_CONTEXT] Login successful:', response.user.username);
      } else {
        console.error('[AUTH_CONTEXT] Invalid login response:', response);
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('[AUTH_CONTEXT] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    const result = authService.hasPermission(permission);
    console.log(`[AUTH_CONTEXT] Permission check: ${permission}, result: ${result}`);
    return result;
  };

  // Check if user has a specific role
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    const roles = Array.isArray(role) ? role : [role];
    const result = authService.hasRole(role);
    console.log(`[AUTH_CONTEXT] Role check: [${roles.join(', ')}], result: ${result}`);
    return result;
  };

  // Compute authentication state
  const isAuthenticated = !!user && !!token;

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
