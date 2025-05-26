// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authManager } from '../services/authManager';
import { authService } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = authManager.getToken();
      const storedUser = authManager.getUser();
      
      if (token && storedUser) {
        try {
          // Check if token is valid on app initialization
          const isValid = await authManager.checkAuthState();
          if (isValid) {
            setIsAuthenticated(true);
            setUser(storedUser);
          } else {
            // Token invalid
            authManager.clearAuthData();
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          authManager.clearAuthData();
          setIsAuthenticated(false);
          setUser(null);
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
        const token = authManager.getToken();
        if (token) {
          authManager.checkAuthState().then(isValid => {
            if (!isValid) {
              authManager.clearAuthData();
              setIsAuthenticated(false);
              setUser(null);
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

  const login = async (username: string, password: string) => {
    setIsLoadingAuth(true);
    try {
      const response = await authService.login({ username, password });
      setIsAuthenticated(true);
      setUser(response.user);
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
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoadingAuth, user, login, logout }}>
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
