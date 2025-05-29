// src/hooks/usePermission.ts
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Permission } from '../types/common';

/**
 * Custom hook for checking user permissions
 * 
 * @returns Permission checking functions
 */
export const usePermission = () => {
  const { hasRole, hasPermission } = useAuth();
  
  /**
   * Check if user has one of the specified roles
   * 
   * @param roles - Role or array of roles to check
   * @returns True if user has any of the specified roles
   */
  const checkRole = (roles: UserRole | UserRole[]): boolean => {
    return hasRole(roles);
  };
  
  /**
   * Check if user has the specified permission
   * 
   * @param permission - Permission to check
   * @returns True if user has the specified permission
   */
  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(permission);
  };
  
  /**
   * Check if user can execute draws (super_admin only)
   * 
   * @returns True if user can execute draws
   */
  const canExecuteDraw = (): boolean => {
    return checkPermission(Permission.EXECUTE_DRAW);
  };
  
  /**
   * Check if user can manage draws (super_admin, admin)
   * 
   * @returns True if user can manage draws
   */
  const canManageDraws = (): boolean => {
    return checkPermission(Permission.MANAGE_DRAWS);
  };
  
  /**
   * Check if user can manage prize structures (super_admin, admin)
   * 
   * @returns True if user can manage prize structures
   */
  const canManagePrizeStructures = (): boolean => {
    return checkPermission(Permission.MANAGE_PRIZE_STRUCTURES);
  };
  
  /**
   * Check if user can upload participants (super_admin, admin, senior_user)
   * 
   * @returns True if user can upload participants
   */
  const canUploadParticipants = (): boolean => {
    return checkPermission(Permission.UPLOAD_PARTICIPANTS);
  };
  
  /**
   * Check if user can manage winners (super_admin, admin)
   * 
   * @returns True if user can manage winners
   */
  const canManageWinners = (): boolean => {
    return checkPermission(Permission.MANAGE_WINNERS);
  };
  
  /**
   * Check if user can view winners (all roles)
   * 
   * @returns True if user can view winners
   */
  const canViewWinners = (): boolean => {
    return checkPermission(Permission.VIEW_WINNERS);
  };
  
  /**
   * Check if user can manage users (super_admin only)
   * 
   * @returns True if user can manage users
   */
  const canManageUsers = (): boolean => {
    return checkPermission(Permission.MANAGE_USERS);
  };
  
  /**
   * Check if user can reset passwords (super_admin, admin)
   * 
   * @returns True if user can reset passwords
   */
  const canResetPasswords = (): boolean => {
    return checkPermission(Permission.RESET_PASSWORDS);
  };
  
  return {
    checkRole,
    checkPermission,
    canExecuteDraw,
    canManageDraws,
    canManagePrizeStructures,
    canUploadParticipants,
    canManageWinners,
    canViewWinners,
    canManageUsers,
    canResetPasswords
  };
};

export default usePermission;
