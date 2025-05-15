// src/services/userService.ts
import axios from 'axios';

// Define the UserData interface to match backend response
export interface UserData {
  id: number | string;
  username: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Locked';
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
}

// Define the CreateUserPayload interface
export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Locked';
  first_name?: string;
  last_name?: string;
}

// Define the UpdateUserPayload interface
export interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  status?: 'Active' | 'Inactive' | 'Locked';
  first_name?: string;
  last_name?: string;
}

// Define the API response for user operations
export interface UserResponse {
  success: boolean;
  message: string;
  data?: UserData | UserData[];
  error?: string;
}

// User service functions
const userService = {
  // List all users
  listUsers: async (token: string): Promise<UserData[]> => {
    try {
      const response = await axios.get('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data as UserData[];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId: string, token: string): Promise<UserData> => {
    try {
      const response = await axios.get(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data as UserData;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData: CreateUserPayload, token: string): Promise<UserData> => {
    try {
      const response = await axios.post('/api/admin/users', userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data as UserData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update an existing user
  updateUser: async (userId: string, userData: UpdateUserPayload, token: string): Promise<UserData> => {
    try {
      const response = await axios.put(`/api/admin/users/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data as UserData;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (userId: string, token: string): Promise<void> => {
    try {
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }
};

export { userService };
