import axios from 'axios';
import { apiClient } from './apiClient';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
  };
}

const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // Create a modified axios instance with increased timeout for login
    const loginClient = axios.create({
      baseURL: apiClient.defaults.baseURL,
      timeout: 30000, // Increase timeout to 30 seconds for login requests
      headers: apiClient.defaults.headers
    });
    
    // Check if the username looks like an email
    const isEmail = credentials.username.includes('@');
    
    // Always include username field to satisfy backend validation
    // Additionally include email field if the input looks like an email
    const payload = {
      username: credentials.username, // Always include username field
      password: credentials.password,
      ...(isEmail && { email: credentials.username }) // Add email field if username looks like an email
    };
    
    // Remove sensitive logging - only log non-sensitive information
    console.log('Attempting login...');
    
    // Fix: Remove the duplicate /api/v1 prefix
    const response = await loginClient.post<LoginResponse>(`/auth/login`, payload);
    
    // Store token and user info in localStorage for session persistence
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('tokenExpiry', response.data.expiresAt);
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Login request timed out. Please try again later.');
      }
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
