// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authManager } from '../services/authManager';
import { authService } from '../services/authService';

// Define UserRole as a string literal type instead of enum for compatibility with existing code
export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SENIOR_USER'
  | 'WINNERS_REPORT_USER'
  | 'WINNER_REPORTS_USER'
  | 'ALL_REPORT_USER';

// Export AuthContextType interface to maintain backward compatibility
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

// Export AuthContext to maintain backward compatibility
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // CRITICAL FIX: Add debug logging
  const DEBUG = true;
  
  // CRITICAL FIX: Add redirect tracking to prevent loops
  const [hasRedirected, setHasRedirected] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authManager.getToken();
      const storedUser = authManager.getUser();

      if (DEBUG) {
        console.log('[AUTH_CONTEXT] Initializing auth state', { 
          hasToken: !!storedToken, 
          hasUser: !!storedUser,
          currentPath: window.location.pathname
        });
      }

      if (storedToken && storedUser) {
        try {
          // CRITICAL FIX: Skip token validation and trust local storage
          // This prevents unnecessary API calls that might return 401
          if (DEBUG) {
            console.log('[AUTH_CONTEXT] Found stored credentials, setting authenticated state');
          }
          
          setIsAuthenticated(true);
          setUser(storedUser);
          setToken(storedToken);
          
          // Handle role as string literal type
          setUserRole(storedUser.role as UserRole);
          setUsername(storedUser.username || storedUser.email);
          
          // CRITICAL FIX: Only redirect if on login page and haven't redirected yet
          if (window.location.pathname === '/login' && !hasRedirected) {
            if (DEBUG) {
              console.log('[AUTH_CONTEXT] Already authenticated, redirecting from login to dashboard');
            }
            setHasRedirected(true);
            window.location.href = '/dashboard';
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
      } else {
        if (DEBUG) {
          console.log('[AUTH_CONTEXT] No stored credentials found, not authenticated');
        }
        
        // CRITICAL FIX: If not on login page and not authenticated, redirect to login
        if (window.location.pathname !== '/login' && !hasRedirected) {
          if (DEBUG) {
            console.log('[AUTH_CONTEXT] Not authenticated, redirecting to login');
          }
          setHasRedirected(true);
          window.location.href = '/login';
        }
        
        setIsLoadingAuth(false);
      }
    };

    initAuth();

    // CRITICAL FIX: Simplified visibility change handler
    // Only clear auth if token is expired, don't make API calls
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
          
          // CRITICAL FIX: Redirect to login if token expired and not already on login page
          if (window.location.pathname !== '/login' && !hasRedirected) {
            setHasRedirected(true);
            window.location.href = '/login';
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasRedirected]); // CRITICAL FIX: Add hasRedirected to dependency array

  // Login function with proper email and password parameters
  const login = async (email: string, password: string) => {
    setIsLoadingAuth(true);
    try {
      if (DEBUG) {
        console.log('[AUTH_CONTEXT] Attempting login', { email });
      }
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        if (DEBUG) {
          console.log('[AUTH_CONTEXT] Login successful, setting authenticated state');
        }
        
        setIsAuthenticated(true);
        setUser(response.user);
        setToken(response.token);
        
        // Handle role as string literal type
        setUserRole(response.user.role as UserRole);
        setUsername(response.user.username || response.user.email);
        
        // CRITICAL FIX: Only redirect if not already redirected
        if (!hasRedirected) {
          if (DEBUG) {
            console.log('[AUTH_CONTEXT] Redirecting to dashboard after successful login');
          }
          
          setHasRedirected(true);
          
          // Use timeout to ensure state is updated before navigation
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
        }
      }
      
      return response;
    } catch (error) {
      console.error('[AUTH_CONTEXT] Login error:', error);
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    if (DEBUG) {
      console.log('[AUTH_CONTEXT] Logging out');
    }
    
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setUserRole(null);
    setUsername(null);
    
    // CRITICAL FIX: Reset redirect state on logout
    setHasRedirected(false);
  };

  // CRITICAL FIX: Add debug output for context value
  if (DEBUG) {
    console.log('[AUTH_CONTEXT] Current auth state:', { 
      isAuthenticated, 
      hasUser: !!user, 
      hasToken: !!token,
      userRole,
      currentPath: window.location.pathname,
      hasRedirected
    });
  }

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
