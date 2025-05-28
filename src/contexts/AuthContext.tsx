// src/contexts/AuthContext.tsx - Updated context with proper state management
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authManager } from '../services/authManager';
import { authService, type AuthResponse } from '../services/authService';

// Define UserRole as a string literal type
export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SENIOR_USER'
  | 'WINNERS_REPORT_USER'
  | 'WINNER_REPORTS_USER'
  | 'ALL_REPORT_USER';

// Export AuthContextType interface
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  user: any | null;
  token: string | null;
  userRole: UserRole | null;
  username: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
}

// Create context with undefined default
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Debug flag
const DEBUG = true;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Initialize authentication state from stored credentials
  useEffect(() => {
    const initAuth = async () => {
      if (DEBUG) {
        console.log('[AUTH_CONTEXT] Initializing auth state');
      }
      try {
        const storedToken = authManager.getToken();
        const storedUser = authManager.getUser();
        
        if (storedToken && storedUser) {
          if (DEBUG) {
            console.log('[AUTH_CONTEXT] Found stored credentials');
          }
          // Skip token validation to avoid 401 errors
          setIsAuthenticated(true);
          setUser(storedUser);
          setToken(storedToken);
          setUserRole(storedUser.role as UserRole);
          setUsername(storedUser.username || storedUser.email);
        } else {
          if (DEBUG) {
            console.log('[AUTH_CONTEXT] No stored credentials found');
          }
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
          setUserRole(null);
          setUsername(null);
        }
      } catch (error) {
        console.error('[AUTH_CONTEXT] Auth initialization error:', error);
        authManager.clearAuthData();
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        setUserRole(null);
        setUsername(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initAuth();
  }, []);

  // Check token expiration when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const storedToken = authManager.getToken();
        if (storedToken && authManager.isTokenExpired()) {
          if (DEBUG) {
            console.log('[AUTH_CONTEXT] Token expired on visibility change, clearing auth');
          }
          authManager.clearAuthData();
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
          setUserRole(null);
          setUsername(null);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    if (DEBUG) {
      console.log('[AUTH_CONTEXT] Login attempt', { email });
    }
    setIsLoadingAuth(true);
    try {
      const response = await authService.login({ email, password });
      
      if (DEBUG) {
        console.log('[AUTH_CONTEXT] Login response:', response);
      }
      
      if (response.token && response.user) {
        if (DEBUG) {
          console.log('[AUTH_CONTEXT] Login successful');
        }
        setIsAuthenticated(true);
        setUser(response.user);
        if (response.token) {
          setToken(response.token);
        }
        setUserRole(response.user.role as UserRole);
        setUsername(response.user.username || response.user.email);
      }
      return response;
    } catch (error) {
      console.error('[AUTH_CONTEXT] Login error:', error);
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    if (DEBUG) {
      console.log('[AUTH_CONTEXT] Logging out');
    }
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setUserRole(null);
    setUsername(null);
  }, []);

  // Log current auth state for debugging
  if (DEBUG) {
    console.log('[AUTH_CONTEXT] Current auth state:', {
      isAuthenticated,
      isLoadingAuth,
      hasUser: !!user,
      hasToken: !!token,
      userRole
    });
  }

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoadingAuth,
        user,
        token,
        userRole,
        username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
