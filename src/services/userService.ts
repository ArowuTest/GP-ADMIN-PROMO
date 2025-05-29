// src/services/userService.ts
import { enhancedApiClient } from './apiClient';
import { 
  UserResponse, 
  UserCreateRequest, 
  UserUpdateRequest,
  PaginatedResponse
} from '../types/api';
import { UUID } from '../types/common';

/**
 * Service for user management
 */
export const userService = {
  /**
   * Get all users with pagination
   * 
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Paginated list of users
   */
  getUsers: async (
    page = 1, 
    pageSize = 10
  ): Promise<PaginatedResponse<UserResponse>> => {
    return enhancedApiClient.getPaginated<UserResponse>('/admin/users', { 
      page, 
      pageSize 
    });
  },

  /**
   * Get user by ID
   * 
   * @param id - User ID
   * @returns User details
   */
  getUserById: async (id: UUID): Promise<UserResponse> => {
    return enhancedApiClient.get<UserResponse>(`/admin/users/${id}`);
  },

  /**
   * Create a new user
   * 
   * @param data - User data
   * @returns Created user
   */
  createUser: async (data: UserCreateRequest): Promise<UserResponse> => {
    return enhancedApiClient.post<UserResponse>('/admin/users', data);
  },

  /**
   * Update an existing user
   * 
   * @param id - User ID
   * @param data - Updated user data
   * @returns Updated user
   */
  updateUser: async (id: UUID, data: UserUpdateRequest): Promise<UserResponse> => {
    return enhancedApiClient.put<UserResponse>(`/admin/users/${id}`, data);
  },

  /**
   * Reset user password
   * 
   * @param userId - User ID
   * @param newPassword - New password
   * @returns Success message
   */
  resetPassword: async (userId: UUID, newPassword: string): Promise<{ message: string }> => {
    return enhancedApiClient.post<{ message: string }>('/admin/users/reset-password', {
      userId,
      newPassword
    });
  },

  /**
   * Get current user profile
   * 
   * @returns Current user details
   */
  getCurrentUserProfile: async (): Promise<UserResponse> => {
    return enhancedApiClient.get<UserResponse>('/admin/users/profile');
  }
};

export default userService;
