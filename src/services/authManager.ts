// src/services/authManager.ts
import { UserResponse } from '../types/api';
import { UserRole, Permission } from '../types/common';
import { LoginCredentials } from './authService';

// Local storage keys
const TOKEN_KEY = 'mtn_mega_billion_token';
const USER_KEY = 'mtn_mega_billion_user';
const TOKEN_EXPIRY_KEY = 'mtn_mega_billion_token_expiry';
const REFRESH_TOKEN_KEY = 'mtn_mega_billion_refresh_token';
const PERMISSIONS_KEY = 'mtn_mega_billion_permissions';
const CREDENTIALS_KEY = 'mtn_mega_billion_credentials';

// Store token in local storage
const storeToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Get token from local storage
const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

// Store refresh token in local storage
const storeRefreshToken = (refreshToken: string): void => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error storing refresh token:', error);
  }
};

// Get refresh token from local storage
const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

// Store user data in local storage
const storeUser = (user: UserResponse): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

// Get user data from local storage
const getUser = (): UserResponse | null => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  return null;
};

// Store token expiry time
const storeTokenExpiry = (expiryTime: string): void => {
  try {
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime);
  } catch (error) {
    console.error('Error storing token expiry:', error);
  }
};

// Get token expiry time
const getTokenExpiry = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error retrieving token expiry:', error);
    return null;
  }
};

// Store user permissions
const storePermissions = (permissions: Permission[]): void => {
  try {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
  } catch (error) {
    console.error('Error storing permissions data:', error);
  }
};

// Get user permissions
const getPermissions = (): Permission[] => {
  try {
    const permissionsData = localStorage.getItem(PERMISSIONS_KEY);
    if (permissionsData) {
      return JSON.parse(permissionsData);
    }
  } catch (error) {
    console.error('Error parsing permissions data:', error);
  }
  return [];
};

// Store login credentials (encrypted would be better in production)
const storeCredentials = (credentials: LoginCredentials): void => {
  try {
    // In a production environment, these should be encrypted
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  } catch (error) {
    console.error('Error storing credentials:', error);
  }
};

// Get stored credentials
const getStoredCredentials = (): LoginCredentials | null => {
  try {
    const credentialsData = localStorage.getItem(CREDENTIALS_KEY);
    if (credentialsData) {
      return JSON.parse(credentialsData);
    }
  } catch (error) {
    console.error('Error parsing credentials data:', error);
  }
  return null;
};

// Check if token is expired
const isTokenExpired = (): boolean => {
  const expiryTime = getTokenExpiry();
  if (!expiryTime) return true;
  
  try {
    const expiryDate = new Date(expiryTime);
    return expiryDate <= new Date();
  } catch (error) {
    console.error('Error parsing token expiry:', error);
    return true;
  }
};

// Clear all auth data from local storage
const clearAuthData = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(PERMISSIONS_KEY);
    localStorage.removeItem(CREDENTIALS_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Check if user has specific role
const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
  const user = getUser();
  if (!user) return false;
  
  // Convert to array for consistent handling
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Ensure user.role is treated as UserRole
  const userRole = user.role as UserRole;
  
  // Super admin has access to everything
  if (userRole === UserRole.SUPER_ADMIN) return true;
  
  // Check if user's role is in the required roles
  return requiredRoles.includes(userRole);
};

// Check specific permissions based on role
const hasPermission = (permission: Permission): boolean => {
  // First try to use stored permissions
  const permissions = getPermissions();
  if (permissions.length > 0) {
    return permissions.includes(permission);
  }
  
  const user = getUser();
  if (!user) return false;
  
  // Role-based permission mapping
  const rolePermissions: Record<string, Permission[]> = {
    [UserRole.SUPER_ADMIN]: [
      Permission.VIEW_DASHBOARD, Permission.EXECUTE_DRAW, Permission.MANAGE_DRAWS, Permission.MANAGE_PRIZE_STRUCTURES,
      Permission.MANAGE_PARTICIPANTS, Permission.UPLOAD_PARTICIPANTS, Permission.VIEW_WINNERS, Permission.MANAGE_WINNERS,
      Permission.MANAGE_USERS, Permission.RESET_PASSWORDS, Permission.VIEW_REPORTS, Permission.MANAGE_NOTIFICATIONS
    ],
    [UserRole.ADMIN]: [
      Permission.VIEW_DASHBOARD, Permission.MANAGE_DRAWS, Permission.MANAGE_PRIZE_STRUCTURES,
      Permission.MANAGE_PARTICIPANTS, Permission.UPLOAD_PARTICIPANTS, Permission.VIEW_WINNERS, Permission.MANAGE_WINNERS,
      Permission.RESET_PASSWORDS, Permission.VIEW_REPORTS, Permission.MANAGE_NOTIFICATIONS
    ],
    [UserRole.SENIOR_USER]: [
      Permission.VIEW_DASHBOARD, Permission.UPLOAD_PARTICIPANTS, Permission.VIEW_WINNERS,
      Permission.VIEW_REPORTS, Permission.MANAGE_NOTIFICATIONS
    ],
    [UserRole.WINNERS_REPORT_USER]: [
      Permission.VIEW_DASHBOARD, Permission.VIEW_WINNERS
    ],
    [UserRole.ALL_REPORT_USER]: [
      Permission.VIEW_DASHBOARD, Permission.VIEW_REPORTS, Permission.MANAGE_NOTIFICATIONS
    ]
  };
  
  // Get permissions for user's role
  const userPermissions = rolePermissions[user.role] || [];
  
  // Check if user has the required permission
  return userPermissions.includes(permission);
};

// Check and refresh token if needed
const checkAndRefreshTokenIfNeeded = async (): Promise<boolean> => {
  if (isTokenExpired()) {
    // This would need to be implemented in coordination with authService
    // For now, just return false to indicate refresh is needed
    return false;
  }
  return true;
};

// Export the auth manager
export const authManager = {
  storeToken,
  getToken,
  storeRefreshToken,
  getRefreshToken,
  storeUser,
  getUser,
  storeTokenExpiry,
  getTokenExpiry,
  storePermissions,
  getPermissions,
  storeCredentials,
  getStoredCredentials,
  isTokenExpired,
  clearAuthData,
  hasRole,
  hasPermission,
  checkAndRefreshTokenIfNeeded
};

export default authManager;
