import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'; // Ensure VITE_API_BASE_URL is in .env.development

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    role: string; // Consider using an enum or specific type here
    firstName: string;
    lastName: string;
  };
}

const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Login failed');
    }
    throw new Error('Login failed due to an unexpected error.');
  }
};

// Placeholder for a function to validate token with backend (e.g., on app load)
// const validateToken = async (token: string) => { ... };

// Placeholder for a function to refresh token
// const refreshToken = async () => { ... };

export const authService = {
  login,
  // validateToken, // Add when implemented
  // refreshToken, // Add when implemented
};

