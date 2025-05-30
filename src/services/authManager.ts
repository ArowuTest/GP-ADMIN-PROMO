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
    console.log('[AUTH_MANAGER] Storing token:', token ? `${token.substring(0, 10)}...` : 'empty');
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('[AUTH_MANAGER] Error storing token:', error);
  }
};

// Get token from local storage
const getToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('[AUTH_MANAGER] Retrieved token:', token ? `${token.substring(0, 10)}...` : 'null');
    return token;
  } catch (error) {
    console.error('[AUTH_MANAGER] Error retrieving token:', error);
    return null;
  }
};

// Store refresh token in local storage
const storeRefreshToken = (refreshToken: string): void => {
  try {
    console.log('[AUTH_MANAGER] Storing refresh token:', refreshToken ? `${refreshToken.substring(0, 10)}...` : 'empty');
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('[AUTH_MANAGER] Error storing refresh token:', error);
  }
};

// Get refresh token from local storage
const getRefreshToken = (): string | null => {
  try {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    console.log('[AUTH_MANAGER] Retrieved refresh token:', refreshToken ? `${refreshToken.substring(0, 10)}...` : 'null');
    return refreshToken;
  } catch (error) {
    console.error('[AUTH_MANAGER] Error retrieving refresh token:', error);
    return null;
  }
};

// Store user data in local storage
const storeUser = (user: UserResponse): void => {
  try {
    console.log('[AUTH_MANAGER] Storing user data:', user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('[AUTH_MANAGER] Error storing user data:', error);
  }
};

// Get user data from local storage
const getUser = (): UserResponse | null => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      const user = JSON.parse(userData);
      console.log('[AUTH_MANAGER] Retrieved user data:', user);
      return user;
    }
    console.log('[AUTH_MANAGER] No user data found');
    return null;
  } catch (error) {
    console.error('[AUTH_MANAGER] Error parsing user data:', error);
    return null;
  }
};

// Store token expiry time
const storeTokenExpiry = (expiryTime: string): void => {
  try {
    console.log('[AUTH_MANAGER] Storing token expiry:', expiryTime);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime);
  } catch (error) {
    console.error('[AUTH_MANAGER] Error storing token expiry:', error);
  }
};

// Get token expiry time
const getTokenExpiry = (): string | null => {
  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    console.log('[AUTH_MANAGER] Retrieved token expiry:', expiry);
    return expiry;
  } catch (error) {
    console.error('[AUTH_MANAGER] Error retrieving token expiry:', error);
    return null;
  }
};

// Store user permissions
const storePermissions = (permissions: Permission[]): void => {
  try {
    console.log('[AUTH_MANAGER] Storing permissions:', permissions);
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
  } catch (error) {
    console.error('[AUTH_MANAGER] Error storing permissions data:', error);
  }
};

// Get user permissions
const getPermissions = (): Permission[] => {
  try {
    const permissionsData = localStorage.getItem(PERMISSIONS_KEY);
    if (permissionsData) {
      const permissions = JSON.parse(permissionsData);
      console.log('[AUTH_MANAGER] Retrieved permissions:', permissions);
      return permissions;
    }
    console.log('[AUTH_MANAGER] No permissions found');
    return [];
  } catch (error) {
    console.error('[AUTH_MANAGER] Error parsing permissions data:', error);
    return [];
  }
};

// Store login credentials (encrypted would be better in production)
const storeCredentials = (credentials: LoginCredentials): void => {
  try {
    // In a production environment, these should be encrypted
    console.log('[AUTH_MANAGER] Storing credentials for username:', credentials.username);
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  } catch (error) {
    console.error('[AUTH_MANAGER] Error storing credentials:', error);
  }
};

// Get stored credentials
const getStoredCredentials = (): LoginCredentials | null => {
  try {
    const credentialsData = localStorage.getItem(CREDENTIALS_KEY);
    if (credentialsData) {
      const credentials = JSON.parse(credentialsData);
      console.log('[AUTH_MANAGER] Retrieved credentials for username:', credentials.username);
      return credentials;
    }
    console.log('[AUTH_MANAGER] No stored credentials found');
    return null;
  } catch (error) {
    console.error('[AUTH_MANAGER] Error parsing credentials data:', error);
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (): boolean => {
  const expiryTime = getTokenExpiry();
  if (!expiryTime) {
    console.log('[AUTH_MANAGER] No token expiry found, considering token expired');
    return true;
  }
  
  try {
    const expiryDate = new Date(expiryTime);
    const now = new Date();
    const isExpired = expiryDate <= now;
    
    console.log(`[AUTH_MANAGER] Token expiry check: expiry=${expiryDate.toISOString()}, now=${now.toISOString()}, isExpired=${isExpired}`);
    return isExpired;
  } catch (error) {
    console.error('[AUTH_MANAGER] Error parsing token expiry:', error);
    return true;
  }
};

// Clear all auth data from local storage
const clearAuthData = (): void => {
  try {
    console.log('[AUTH_MANAGER] Clearing all auth data');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(PERMISSIONS_KEY);
    localStorage.removeItem(CREDENTIALS_KEY);
  } catch (error) {
    console.error('[AUTH_MANAGER] Error clearing auth data:', error);
  }
};

// Check if user has specific role
const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
  const user = getUser();
  if (!user) {
    console.log('[AUTH_MANAGER] No user data found for role check');
    return false;
  }
  
  // Convert to array for consistent handling
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Ensure user.role is treated as UserRole
  const userRole = user.role as UserRole;
  
  // Super admin has access to everything
  if (userRole === UserRole.SUPER_ADMIN) {
    console.log('[AUTH_MANAGER] User has SUPER_ADMIN role, granting access');
    return true;
  }
  
  // Check if user's role is in the required roles
  const hasRequiredRole = requiredRoles.includes(userRole);
  console.log(`[AUTH_MANAGER] Role check: userRole=${userRole}, requiredRoles=[${requiredRoles.join(', ')}], hasAccess=${hasRequiredRole}`);
  return hasRequiredRole;
};

// Check specific permissions based on role
const hasPermission = (permission: Permission): boolean => {
  // First try to use stored permissions
  const permissions = getPermissions();
  if (permissions.length > 0) {
    const hasStoredPermission = permissions.includes(permission);
    console.log(`[AUTH_MANAGER] Permission check from stored permissions: permission=${permission}, hasPermission=${hasStoredPermission}`);
    return hasStoredPermission;
  }
  
  const user = getUser();
  if (!user) {
    console.log('[AUTH_MANAGER] No user data found for permission check');
    return false;
  }
  
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
  const hasRequiredPermission = userPermissions.includes(permission);
  console.log(`[AUTH_MANAGER] Permission check from role: role=${user.role}, permission=${permission}, hasPermission=${hasRequiredPermission}`);
  return hasRequiredPermission;
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
  hasPermission
};

export default authManager;
