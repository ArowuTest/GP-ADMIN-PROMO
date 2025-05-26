// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authManager } from '../services/authManager';
import { authService } from '../services/authService';

// Export UserRole enum to maintain backward compatibility
// Note: Including both correct spelling and the typo version for compatibility
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SENIOR_USER = 'SENIOR_USER',
  WINNERS_REPORT_USER = 'WINNERS_REPORT_USER',
  WINNER_REPORTS_USER = 'WINNER_REPORTS_USER', // Include the typo version for compatibility
  ALL_REPORT_USER = 'ALL_REPORT_USER'
}

// Export AuthContextType interface to maintain backward compatibility
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  user: any | null;
  token: string | null; // Added for backward compatibility
  userRole: UserRole | null; // Added for backward compatibility
  username: string | null; // Added for backward compatibility
  login: (credentials: any) => Promise<any>; // Accept any credentials format for backward compatibility
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

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authManager.getToken();
      const storedUser = authManager.getUser();
      
      if (storedToken && storedUser) {
        try {
          // Check if token is valid on app initialization
          const isValid = await authManager.checkAuthState();
          if (isValid) {
            setIsAuthenticated(true);
            setUser(storedUser);
            setToken(storedToken);
            // Handle both string and enum values for role
            setUserRole(typeof storedUser.role === 'string' ? storedUser.role as UserRole : storedUser.role);
            setUsername(storedUser.username);
          } else {
            // Token invalid
            authManager.clearAuthData();
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            setUserRole(null);
            setUsername(null);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
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
        setIsLoadingAuth(false);
      }
    };
    
    initAuth();
    
    // Add visibility change listener to revalidate when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const storedToken = authManager.getToken();
        if (storedToken) {
          authManager.checkAuthState().then(isValid => {
            if (!isValid) {
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
    setIsLoadingAuth(true);
    try {
      // Handle both object and string username formats
      const loginCredentials = typeof credentials === 'string' 
        ? { username: credentials, password: '' } // Password will be provided separately in some components
        : credentials;
        
      const response = await authService.login(loginCredentials);
      setIsAuthenticated(true);
      setUser(response.user);
      setToken(response.token);
      // Handle both string and enum values for role
      setUserRole(typeof response.user.role === 'string' ? response.user.role as UserRole : response.user.role);
      setUsername(response.user.username);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setUserRole(null);
    setUsername(null);
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
