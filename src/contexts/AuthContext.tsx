// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

// Define the shape of our authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuthState: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
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
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
        
        // Update state
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Clear auth data if token is expired or doesn't exist
        handleLogout();
      }
    } catch (error) {
      console.error('Error checking authentication state:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // Function to handle login
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Call login service
      const response = await authService.login(username, password);
      
      // Check if login was successful by verifying token exists
      if (response && response.token) {
        // Update state
        setToken(response.token);
        setUser(response.user);
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
    setIsAuthenticated(false);
  };

  // Value object that will be passed to consumers of this context
  const value = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    checkAuthState,
  };

  // Return the provider with the value
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
