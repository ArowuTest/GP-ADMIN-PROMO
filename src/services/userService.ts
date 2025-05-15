// src/services/userService.ts
import { apiClient } from './apiClient';
import { MOCK_MODE } from './apiClient';

// Import UserRole type from AuthContext using type-only import
import type { UserRole } from '../contexts/AuthContext';

// Define the UserData interface to match backend response
export interface UserData {
  id: number | string;
  username: string;
  email: string;
  role: UserRole;
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
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Locked';
  first_name?: string;
  last_name?: string;
}

// Define the UpdateUserPayload interface
export interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
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

// Mock data for development and testing
const mockUsers: UserData[] = [
  {
    id: 1,
    username: 'superadmin',
    email: 'superadmin@example.com',
    role: 'SUPER_ADMIN',
    status: 'Active',
    first_name: 'Super',
    last_name: 'Admin',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    role: 'ADMIN',
    status: 'Active',
    first_name: 'Regular',
    last_name: 'Admin',
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z'
  },
  {
    id: 3,
    username: 'senioruser',
    email: 'senior@example.com',
    role: 'SENIOR_USER',
    status: 'Active',
    first_name: 'Senior',
    last_name: 'User',
    created_at: '2025-01-03T00:00:00Z',
    updated_at: '2025-01-03T00:00:00Z'
  },
  {
    id: 4,
    username: 'reportuser',
    email: 'report@example.com',
    role: 'WINNER_REPORTS_USER',
    status: 'Active',
    first_name: 'Report',
    last_name: 'User',
    created_at: '2025-01-04T00:00:00Z',
    updated_at: '2025-01-04T00:00:00Z'
  },
  {
    id: 5,
    username: 'inactiveuser',
    email: 'inactive@example.com',
    role: 'ADMIN',
    status: 'Inactive',
    first_name: 'Inactive',
    last_name: 'User',
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2025-01-05T00:00:00Z'
  }
];

// User service functions
const userService = {
  // List all users
  listUsers: async (token: string): Promise<UserData[]> => {
    if (MOCK_MODE) {
      console.log('Using mock user data');
      return Promise.resolve([...mockUsers]);
    }

    try {
      const response = await apiClient.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data as UserData[];
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data if API fails
      return [...mockUsers];
    }
  },

  // Get user by ID
  getUserById: async (userId: string, token: string): Promise<UserData> => {
    if (MOCK_MODE) {
      const user = mockUsers.find(u => u.id.toString() === userId);
      if (user) {
        return Promise.resolve({...user});
      }
      return Promise.reject(new Error(`User with ID ${userId} not found`));
    }

    try {
      const response = await apiClient.get(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data as UserData;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      
      // Fallback to mock data if API fails
      const user = mockUsers.find(u => u.id.toString() === userId);
      if (user) {
        return {...user};
      }
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData: CreateUserPayload, token: string): Promise<UserData> => {
    if (MOCK_MODE) {
      const newId = Math.max(...mockUsers.map(u => Number(u.id))) + 1;
      const newUser: UserData = {
        id: newId,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        first_name: userData.first_name,
        last_name: userData.last_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockUsers.push(newUser);
      return Promise.resolve({...newUser});
    }

    try {
      const response = await apiClient.post('/admin/users', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data as UserData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update an existing user
  updateUser: async (userId: string, userData: UpdateUserPayload, token: string): Promise<UserData> => {
    if (MOCK_MODE) {
      const index = mockUsers.findIndex(u => u.id.toString() === userId);
      if (index === -1) {
        return Promise.reject(new Error(`User with ID ${userId} not found`));
      }
      
      const updatedUser = {
        ...mockUsers[index],
        ...userData,
        updated_at: new Date().toISOString()
      };
      
      mockUsers[index] = updatedUser;
      return Promise.resolve({...updatedUser});
    }

    try {
      const response = await apiClient.put(`/admin/users/${userId}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data as UserData;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (userId: string, token: string): Promise<void> => {
    if (MOCK_MODE) {
      const index = mockUsers.findIndex(u => u.id.toString() === userId);
      if (index === -1) {
        return Promise.reject(new Error(`User with ID ${userId} not found`));
      }
      
      mockUsers.splice(index, 1);
      return Promise.resolve();
    }

    try {
      await apiClient.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }
};

export { userService };
