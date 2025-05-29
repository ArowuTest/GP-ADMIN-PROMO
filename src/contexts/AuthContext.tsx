// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserResponse } from '../types/api';
import { Permission, UserRole } from '../types/common';

// Define the context shape
interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  hasPermission: () => false,
  hasRole: () => false
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = authService.checkAuthState();
        
        if (isAuthenticated) {
          // Get current user from auth manager
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await authService.login({ username: email, password });
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
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
  const isAuthenticated = !!user;

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
