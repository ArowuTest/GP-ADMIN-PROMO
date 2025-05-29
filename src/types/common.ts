// src/types/common.ts
/**
 * Common type definitions
 */

export type UUID = string;

/**
 * Draw status enum
 */
export enum DrawStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * Winner status enum
 */
export enum WinnerStatus {
  PENDING_NOTIFICATION = 'PENDING_NOTIFICATION',
  NOTIFIED = 'NOTIFIED',
  CONFIRMED = 'CONFIRMED',
  FORFEITED = 'FORFEITED'
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED'
}

/**
 * Upload status enum
 */
export enum UploadStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * User role enum
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SENIOR_USER = 'SENIOR_USER',
  WINNERS_REPORT_USER = 'WINNERS_REPORT_USER',
  ALL_REPORT_USER = 'ALL_REPORT_USER'
}

/**
 * Permission enum
 */
export enum Permission {
  VIEW_DASHBOARD = 'view_dashboard',
  EXECUTE_DRAW = 'execute_draw',
  MANAGE_DRAWS = 'manage_draws',
  MANAGE_PRIZE_STRUCTURES = 'manage_prize_structures',
  MANAGE_PARTICIPANTS = 'manage_participants',
  UPLOAD_PARTICIPANTS = 'upload_participants',
  VIEW_WINNERS = 'view_winners',
  MANAGE_WINNERS = 'manage_winners',
  MANAGE_USERS = 'manage_users',
  RESET_PASSWORDS = 'reset_passwords',
  VIEW_REPORTS = 'view_reports',
  MANAGE_NOTIFICATIONS = 'manage_notifications'
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}
