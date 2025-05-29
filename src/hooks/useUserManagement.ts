// src/hooks/useUserManagement.ts
import { useState, useCallback } from 'react';
import { userService } from '../services/userService';
import { UserResponse, UserCreateRequest, UserUpdateRequest } from '../types/api';
import { UUID } from '../types/common';

/**
 * Custom hook for user management functionality
 */
export const useUserManagement = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user by ID
   */
  const loadUserById = useCallback(async (id: UUID): Promise<UserResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await userService.getUserById(id);
      setSelectedUser(user);
      return user;
    } catch (err: any) {
      console.error('Error loading user:', err);
      setError(err.message || 'Failed to load user');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new user
   */
  const createUser = useCallback(async (data: UserCreateRequest): Promise<UserResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newUser = await userService.createUser(data);
      return newUser;
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user
   */
  const updateUser = useCallback(async (id: UUID, data: UserUpdateRequest): Promise<UserResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await userService.updateUser(id, data);
      
      // Update selected user if it's the one being updated
      if (selectedUser && selectedUser.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }
      
      return updatedUser;
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser]);

  /**
   * Reset user password
   */
  const resetPassword = useCallback(async (userId: UUID, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await userService.resetPassword(userId, newPassword);
      return true;
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Failed to reset password');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    selectedUser,
    error,
    loadUserById,
    createUser,
    updateUser,
    resetPassword
  };
};

export default useUserManagement;
