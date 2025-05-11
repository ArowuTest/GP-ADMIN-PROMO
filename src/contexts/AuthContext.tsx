// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // Ensure you have jwt-decode installed: npm install jwt-decode

export type UserRole = 'SuperAdmin' | 'Admin' | 'SeniorUser' | 'WinnerReportsUser' | 'AllReportUser' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  username: string | null;
  login: (token: string) => void;
  logout: () => void;
}

interface DecodedToken {
  username: string;
  role: UserRole;
  exp: number;
  // Add other claims if present in your JWT
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUserRole(decodedToken.role);
          setUsername(decodedToken.username);
        } else {
          // Token expired
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Error decoding token on initial load:', error);
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const login = (token: string) => {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      localStorage.setItem('authToken', token);
      setIsAuthenticated(true);
      setUserRole(decodedToken.role);
      setUsername(decodedToken.username);
      // console.log('Logged in. Role:', decodedToken.role, 'Username:', decodedToken.username);
    } catch (error) {
      console.error('Error decoding token on login:', error);
      // Handle login error (e.g., invalid token format)
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername(null);
    // console.log('Logged out');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, username, login, logout }}>
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

