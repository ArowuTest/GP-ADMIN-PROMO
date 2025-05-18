import axios from "axios";
import { apiClient } from './apiClient';
import { MOCK_MODE } from './apiClient';

// Define interfaces for participant-related data structures
export interface ParticipantData {
  msisdn: string;
  points: number;
  rechargeAmount: number; // Changed to camelCase to match backend response
  rechargeDate: string; // Changed to camelCase to match backend response
}

export interface ParticipantStats {
  totalParticipants: number;
  totalPoints: number;
  date: string; // Added to match backend response
}

export interface ParticipantUploadAudit {
  id: string;
  uploadedBy: string; // Changed to camelCase to match backend response
  uploadedAt: string; // Changed to camelCase to match backend response
  fileName: string; // Changed to camelCase to match backend response
  status: string;
  totalRows: number; // Changed to camelCase to match backend response
  successfulRows: number; // Changed to camelCase to match backend response
  errorCount: number; // Changed to camelCase to match backend response
  errorDetails?: string[];
}

export interface UploadResponse {
  message: string;
  auditId: string; // Changed to camelCase to match backend response
  status: string;
  totalDataRowsProcessed: number; // Changed to camelCase to match backend response
  successfulRowsImported: number; // Changed to camelCase to match backend response
  errors: string[];
  duplicatesSkippedCount?: number;
  skippedDuplicateEventDetails?: string[];
}

// Upload participant data CSV file
const uploadParticipantData = async (
  file: File,
  token: string | null
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post<UploadResponse>(
      `/admin/participants/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as Partial<UploadResponse>; 
      throw new Error(
        errorData.message || 
        (errorData.errors && errorData.errors.length > 0 ? errorData.errors.join("; ") : error.message) || 
        "Failed to upload participant data"
      );
    }
    throw new Error("An unexpected error occurred during participant data upload");
  }
};

// Get participant statistics for a specific draw date
const getParticipantStats = async (
  drawDate: string,
  token: string | null
): Promise<ParticipantStats> => {
  try {
    const response = await apiClient.get<ParticipantStats>(
      `/admin/participants/stats?drawDate=${drawDate}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching participant stats:", error);
    
    // Only use mock data as absolute last resort if API is completely unreachable
    if (MOCK_MODE || (axios.isAxiosError(error) && error.code === 'ECONNABORTED')) {
      console.warn("API unreachable, using minimal mock data as fallback");
      return {
        totalParticipants: 0,
        totalPoints: 0,
        date: drawDate
      };
    }
    
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to fetch participant statistics due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to fetch participant statistics due to an unexpected error.");
    } else {
      throw new Error("Failed to fetch participant statistics due to an unexpected error.");
    }
  }
};

// List participant upload audit records
const listUploadAudits = async (
  token: string | null
): Promise<ParticipantUploadAudit[]> => {
  try {
    const response = await apiClient.get<ParticipantUploadAudit[]>(
      `/admin/participants/uploads`
    );
    return response.data;
  } catch (error: unknown) {
    if (MOCK_MODE) {
      console.warn("Using mock upload audit data due to API error:", error);
      return []; // Return empty array as mock data
    }
    
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to fetch upload audit records due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to fetch upload audit records due to an unexpected error.");
    } else {
      throw new Error("Failed to fetch upload audit records due to an unexpected error.");
    }
  }
};

// Get participants for a specific draw date (paginated)
const getParticipantsForDraw = async (
  drawDate: string,
  page: number = 1,
  limit: number = 100,
  token: string | null
): Promise<{ data: ParticipantData[], total: number, page: number, totalPages: number }> => {
  try {
    const response = await apiClient.get<{ data: ParticipantData[], total: number, page: number, totalPages: number }>(
      `/admin/participants?drawDate=${drawDate}&page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error: unknown) {
    if (MOCK_MODE) {
      console.warn("Using mock participant data due to API error:", error);
      return { data: [], total: 0, page: 1, totalPages: 1 }; // Return empty result as mock data
    }
    
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to fetch participants due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to fetch participants due to an unexpected error.");
    } else {
      throw new Error("Failed to fetch participants due to an unexpected error.");
    }
  }
};

// Delete a participant upload by audit ID
const deleteUpload = async (
  auditId: string,
  token: string | null
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(
      `/admin/participants/uploads/${auditId}`
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to delete upload due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to delete upload due to an unexpected error.");
    } else {
      throw new Error("Failed to delete upload due to an unexpected error.");
    }
  }
};

export const participantService = {
  uploadParticipantData,
  getParticipantStats,
  listUploadAudits,
  getParticipantsForDraw,
  deleteUpload
};
