// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react"; // Changed to type-only import for ReactNode
import { jwtDecode } from "jwt-decode";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "SENIOR_USER" | "WINNER_REPORTS_USER" | "ALL_REPORT_USER" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  username: string | null;
  isLoadingAuth: boolean; // New state to track initial auth check
  login: (token: string) => void;
  logout: () => void;
}

interface DecodedToken {
  username: string;
  role: UserRole;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true); // Initialize as true

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUserRole(decodedToken.role);
          setUsername(decodedToken.username);
        } else {
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("Error decoding token on initial load:", error);
        localStorage.removeItem("authToken");
      }
    }
    setIsLoadingAuth(false); // Set to false after check is complete
  }, []);

  const login = (token: string) => {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      localStorage.setItem("authToken", token);
      setIsAuthenticated(true);
      setUserRole(decodedToken.role);
      setUsername(decodedToken.username);
      setIsLoadingAuth(false); // Ensure loading is false after login attempt
    } catch (error) {
      console.error("Error decoding token on login:", error);
      localStorage.removeItem("authToken"); // Clear token if decoding fails
      setIsAuthenticated(false);
      setUserRole(null);
      setUsername(null);
      setIsLoadingAuth(false); // Ensure loading is false after failed login attempt
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername(null);
    // No need to set isLoadingAuth here as it's mainly for initial load/login
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, username, isLoadingAuth, login, logout }}>
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
