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
  login: (credentials: any) => Promise<any>;
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

  // Initialize authentication state from storage
  useEffect(() => {
    console.log('AuthContext: Initializing authentication state');
    const initAuth = async () => {
      try {
        const storedToken = authManager.getToken();
        const storedUser = authManager.getUser();
        
        console.log('AuthContext: Stored token exists:', !!storedToken);
        console.log('AuthContext: Stored user exists:', !!storedUser);
        
        if (storedToken && storedUser) {
          // Check if token is valid
          const isValid = await authManager.checkAuthState();
          console.log('AuthContext: Token validation result:', isValid);
          
          if (isValid) {
            setIsAuthenticated(true);
            setUser(storedUser);
            setToken(storedToken);
            // Handle role as string literal type
            setUserRole(storedUser.role as UserRole);
            setUsername(storedUser.username || storedUser.email);
            console.log('AuthContext: Authentication state restored successfully');
          } else {
            // Token invalid
            console.log('AuthContext: Token invalid, clearing auth data');
            authManager.clearAuthData();
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            setUserRole(null);
            setUsername(null);
          }
        } else {
          console.log('AuthContext: No stored authentication data found');
        }
      } catch (error) {
        console.error('AuthContext: Error during authentication initialization:', error);
        authManager.clearAuthData();
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        setUserRole(null);
        setUsername(null);
      } finally {
        setIsLoadingAuth(false);
        console.log('AuthContext: Authentication loading completed');
      }
    };
    
    initAuth();
    
    // Add visibility change listener to revalidate when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('AuthContext: Document became visible, checking auth state');
        const storedToken = authManager.getToken();
        if (storedToken) {
          authManager.checkAuthState().then(isValid => {
            console.log('AuthContext: Visibility change token validation:', isValid);
            if (!isValid) {
              console.log('AuthContext: Token invalid after visibility change, clearing auth data');
              authManager.clearAuthData();
              setIsAuthenticated(false);
              setUser(null);
              setToken(null);
              setUserRole(null);
              setUsername(null);
            }
          });
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Flexible login function that accepts any credential format for backward compatibility
  const login = async (credentials: any) => {
    console.log('AuthContext: Login attempt started');
    setIsLoadingAuth(true);
    try {
      // Handle both object and string username formats
      const loginCredentials = typeof credentials === 'string' 
        ? { username: credentials, password: '' } // Password will be provided separately in some components
        : credentials;
        
      const response = await authService.login(loginCredentials);
      console.log('AuthContext: Login successful, setting authentication state');
      
      setIsAuthenticated(true);
      setUser(response.user);
      setToken(response.token);
      // Handle role as string literal type
      setUserRole(response.user.role as UserRole);
      setUsername(response.user.username || response.user.email);
      
      return response;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    console.log('AuthContext: Logout initiated');
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setUserRole(null);
    setUsername(null);
    console.log('AuthContext: Logout completed, auth state cleared');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoadingAuth, 
      user, 
      token, 
      userRole, 
      username,
      login, 
      logout 
    }}>
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
