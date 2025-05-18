import axios from 'axios';
import { apiClient } from './apiClient';

interface LoginCredentials {
  username: string; // Changed from email to username
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  expiresAt: string; // Added to match backend response
  user: {
    id: string;
    email: string;
    username: string; // Added to match backend response
    role: string;
    firstName: string;
    lastName: string;
    createdAt: string; // Added to match backend response
    updatedAt: string; // Added to match backend response
  };
}

const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // Fix: Remove the duplicate /api/v1 prefix
    const response = await apiClient.post<LoginResponse>(`/auth/login`, credentials);
    
    // Store token and user info in localStorage for session persistence
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('tokenExpiry', response.data.expiresAt);
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error)) {
      // Improved error handling to extract and surface error messages
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Invalid username or password. Please try again.';
      throw new Error(errorMessage);
    }
    throw new Error('Login failed due to an unexpected error. Please try again later.');
  }
};

// Validate token with backend (e.g., on app load)
const validateToken = async (token: string): Promise<boolean> => {
  try {
    // Fix: Remove the duplicate /api/v1 prefix
    const response = await apiClient.post<{valid: boolean}>(`/auth/validate-token`, { token });
    return response.data.valid;
  } catch (error) {
    // If validation fails, clear stored credentials
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    return false;
  }
};

// Check if token is expired based on expiresAt value
const isTokenExpired = (): boolean => {
  const expiryString = localStorage.getItem('tokenExpiry');
  if (!expiryString) return true;
  
  const expiryTime = new Date(expiryString).getTime();
  const currentTime = new Date().getTime();
  
  // Return true if token is expired
  return currentTime >= expiryTime;
};

// Logout function to clear credentials
const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tokenExpiry');
  window.location.href = '/login';
};

export const authService = {
  login,
  validateToken,
  isTokenExpired,
  logout
};
