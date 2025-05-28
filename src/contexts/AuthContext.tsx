// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

// Define user roles
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SENIOR_USER' | 'WINNER_REPORTS_USER' | 'ALL_REPORT_USER';

// Define the shape of our authentication context
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  user: any;
  userRole: UserRole | null;
  username: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuthState: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoadingAuth: true,
  user: null,
  userRole: null,
  username: null,
  token: null,
  login: async () => false,
  logout: () => {},
  checkAuthState: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Check if the user is authenticated on initial load
  useEffect(() => {
    checkAuthState();
  }, []);

  // Function to check authentication state
  const checkAuthState = () => {
    try {
      // Get token from storage
      const storedToken = authService.getToken();
      
      // Check if token exists and is not expired
      if (storedToken && !authService.isTokenExpired()) {
        // Get user data from storage
        const userData = authService.getUser();
        
        // Extract role and username from user data
        const role = userData?.role || null;
        const name = userData?.username || null;
        
        // Update state
        setToken(storedToken);
        setUser(userData);
        setUserRole(role as UserRole);
        setUsername(name);
        setIsAuthenticated(true);
      } else {
        // Clear auth data if token is expired or doesn't exist
        handleLogout();
      }
    } catch (error) {
      console.error('Error checking authentication state:', error);
      handleLogout();
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Function to handle login - updated to match authService.login signature
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Call login service with object parameter to match authService.login signature
      const response = await authService.login({ email, password });
      
      // Check if login was successful by verifying token exists
      if (response && response.token) {
        // Extract role and username from user data
        const role = response.user?.role || null;
        const name = response.user?.username || null;
        
        // Update state
        setToken(response.token);
        setUser(response.user);
        setUserRole(role as UserRole);
        setUsername(name);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Function to handle logout
  const logout = () => {
    handleLogout();
    // Navigate to login page
    navigate('/login');
  };

  // Helper function to clear auth state
  const handleLogout = () => {
    // Clear auth data from storage
    authService.clearAuthData();
    
    // Reset state
    setToken(null);
    setUser(null);
    setUserRole(null);
    setUsername(null);
    setIsAuthenticated(false);
  };

  // Value object that will be passed to consumers of this context
  const value = {
    isAuthenticated,
    isLoadingAuth,
    user,
    userRole,
    username,
    token,
    login,
    logout,
    checkAuthState,
  };

  // Return the provider with the value
  return (
    <AuthContext.Provider value={value}>
      {!isLoadingAuth && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
