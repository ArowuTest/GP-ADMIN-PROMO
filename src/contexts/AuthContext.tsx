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

  // Check authentication state on mount
  useEffect(() => {
    const checkAuth = async () => {
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
        }
      } catch (error) {
        console.error('[AUTH_CONTEXT] Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth error events
    const handleAuthError = () => {
      console.log('[AUTH_CONTEXT] Auth error event received, attempting token refresh');
      refreshToken().catch(() => {
        console.log('[AUTH_CONTEXT] Token refresh failed, logging out');
        logout();
      });
    };
    
    window.addEventListener('auth-error', handleAuthError);
    
    // Listen for logout events
    const handleLogout = () => {
      console.log('[AUTH_CONTEXT] Logout event received');
      setUser(null);
      setToken(null);
    };
    
    window.addEventListener('auth-logout', handleLogout);
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
      window.removeEventListener('auth-logout', handleLogout);
    };
  }, [logout]); // Added logout to dependency array to fix ESLint warning

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await authService.login({ username: email, password });
      
      if (response && response.token && response.user) {
        setUser(response.user);
        setToken(response.token);
        console.log('[AUTH_CONTEXT] Login successful:', response.user.username);
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('[AUTH_CONTEXT] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshed = await authService.refreshTokenIfNeeded();
      
      if (refreshed) {
        // Update token in state
        const newToken = authService.getToken();
        if (newToken) {
          setToken(newToken);
          console.log('[AUTH_CONTEXT] Token refreshed successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[AUTH_CONTEXT] Token refresh error:', error);
      return false;
    }
  };

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    return authService.hasPermission(permission);
  };

  // Check if user has a specific role
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    return authService.hasRole(role);
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
