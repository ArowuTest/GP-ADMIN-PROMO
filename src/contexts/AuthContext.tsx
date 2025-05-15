// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react"; 
import { jwtDecode } from "jwt-decode";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "SENIOR_USER" | "WINNER_REPORTS_USER" | "ALL_REPORT_USER" | null;

// Export AuthContextType interface
export interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  username: string | null;
  token: string | null; 
  isLoadingAuth: boolean; 
  login: (token: string) => void;
  logout: () => void;
}

interface DecodedToken {
  username: string;
  role: UserRole;
  exp: number;
}

// Export AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null); 
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true); 

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(storedToken);
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUserRole(decodedToken.role);
          setUsername(decodedToken.username);
          setToken(storedToken); 
        } else {
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("Error decoding token on initial load:", error);
        localStorage.removeItem("authToken");
      }
    }
    setIsLoadingAuth(false); 
  }, []);

  const login = (newToken: string) => {
    try {
      const decodedToken = jwtDecode<DecodedToken>(newToken);
      localStorage.setItem("authToken", newToken);
      setIsAuthenticated(true);
      setUserRole(decodedToken.role);
      setUsername(decodedToken.username);
      setToken(newToken); 
      setIsLoadingAuth(false); 
    } catch (error) {
      console.error("Error decoding token on login:", error);
      localStorage.removeItem("authToken"); 
      setIsAuthenticated(false);
      setUserRole(null);
      setUsername(null);
      setToken(null); 
      setIsLoadingAuth(false); 
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername(null);
    setToken(null); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, username, token, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

