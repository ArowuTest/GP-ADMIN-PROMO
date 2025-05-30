// src/types/api.ts
import { UUID, DrawStatus, WinnerStatus, PaymentStatus, UserRole } from './common';

/**
 * API Response Types
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalRows: number; // Changed from totalItems to match backend
  totalPages: number;
}

export interface DrawResponse {
  id: UUID;
  name: string; // Added to match backend
  description: string; // Added to match backend
  drawDate: string;
  status: DrawStatus;
  prizeStructure: UUID; // Changed from prizeStructureId to match backend
  createdAt: string;
  updatedAt: string;
  createdBy: UUID;
  updatedBy: UUID;
}

export interface PrizeResponse {
  id: UUID;
  name: string;
  description: string;
  value: number;
  quantity: number;
  numberOfRunnerUps: number;
  prizeStructureId: UUID;
  createdAt: string;
  updatedAt: string;
}

export interface PrizeStructureResponse {
  id: UUID;
  name: string;
  description: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  prizes: PrizeResponse[];
  createdAt: string;
  updatedAt: string;
  createdBy: UUID;
  updatedBy: UUID;
}

export interface WinnerResponse {
  id: UUID;
  drawId: UUID;
  drawDate: string;
  msisdn: string;
  maskedMsisdn: string;
  prizeTierId: UUID; // Changed from prizeId to match backend
  prizeName: string;
  prizeValue: number;
  status: WinnerStatus;
  paymentStatus: PaymentStatus;
  paymentDate?: string; // Added to match backend
  paymentRef?: string;
  paymentNotes?: string;
  isRunnerUp: boolean;
  runnerUpRank?: number; // Added to match backend
  invokedAt?: string; // Added to match backend
  notifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantResponse {
  id: UUID;
  msisdn: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: UUID;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityStatsResponse {
  date: string; // Renamed from drawDate to match backend
  totalEligible: number;
  totalEntries: number;
}

export interface DrawExecutionResponse {
  id: UUID; // Moved to top to match backend structure
  drawId: UUID;
  drawDate: string;
  status: DrawStatus;
  prizeStructure: UUID; // Changed from prizeStructureId to match backend
  prizeStructureName: string;
  winnersCount: number;
  runnerUpsCount: number;
  executedAt: string;
  winners: DrawWinner[];
  runnerUps: DrawWinner[];
}

export interface DrawWinner {
  id: UUID;
  msisdn: string;
  maskedMsisdn: string;
  prizeTierId: UUID; // Changed from prizeId to match backend
  prizeName: string;
  prizeValue: number;
  status: WinnerStatus;
  isRunnerUp: boolean;
  runnerUpRank?: number; // Added to match backend
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  paymentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantStatsResponse {
  totalParticipants: number;
  totalPoints: number;
  averagePoints: number;
}

export interface DataUploadAuditResponse {
  id: UUID;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
  totalUploaded: number;
  successfullyImported: number;
  duplicatesSkipped: number;
  errorsEncountered: number;
  details?: string; // Added to match backend
  operationType?: string; // Added to match backend
  createdAt: string;
  updatedAt: string;
}

/**
 * API Request Types
 */

export interface DrawCreateRequest {
  drawDate: string;
  prizeStructureId: UUID;
}

export interface DrawUpdateRequest {
  prizeStructureId?: UUID;
  status?: DrawStatus;
}

export interface DrawExecutionRequest {
  drawDate: string; // Changed from date to match backend
  prizeStructureId: UUID;
}

export interface PrizeStructureCreateRequest {
  name: string;
  description: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  prizes: PrizeCreateRequest[];
}

export interface PrizeStructureUpdateRequest {
  name?: string;
  description?: string;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
  prizes?: (PrizeCreateRequest | PrizeUpdateRequest)[];
}

export interface PrizeCreateRequest {
  name: string;
  description: string;
  value: number;
  quantity: number;
  numberOfRunnerUps: number;
}

export interface PrizeUpdateRequest {
  id: UUID;
  name?: string;
  description?: string;
  value?: number;
  quantity?: number;
  numberOfRunnerUps?: number;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

export interface UserUpdateRequest {
  email?: string;
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
  expiry: string;
  refreshToken?: string; // Added as optional to match frontend code expectations
}

export interface WinnerPaymentUpdateRequest {
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  paymentNotes?: string;
}

export interface RunnerUpInvokeRequest {
  winnerId: UUID;
}

export interface RunnerUpInvokeResponse {
  message: string;
  originalWinner: WinnerResponse;
  newWinner: WinnerResponse;
}
