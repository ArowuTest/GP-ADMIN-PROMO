import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// Define interfaces for participant-related data structures
export interface ParticipantData {
  msisdn: string;
  points: number;
  recharge_amount: number;
  recharge_date: string;
}

export interface ParticipantStats {
  totalParticipants: number;
  totalPoints: number;
}

export interface ParticipantUploadAudit {
  id: string;
  uploaded_by: string;
  upload_date: string;
  file_name: string;
  status: string;
  total_rows: number;
  successful_rows: number;
  error_count: number;
  error_details?: string[];
}

export interface UploadResponse {
  message: string;
  audit_id: string;
  status: string;
  total_data_rows_processed: number;
  successful_rows_imported: number;
  errors: string[];
  duplicates_skipped_count?: number;
  skipped_duplicate_event_details?: string[];
}

const getAuthHeaders = (token: string | null) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Upload participant data CSV file
const uploadParticipantData = async (
  file: File,
  token: string | null
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post<UploadResponse>(
      `${API_URL}/admin/participants/upload`,
      formData,
      {
        headers: {
          ...getAuthHeaders(token),
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
    const response = await axios.get<ParticipantStats>(
      `${API_URL}/admin/participants/stats?drawDate=${drawDate}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching participant stats:", error);
    
    // Only use mock data as absolute last resort if API is completely unreachable
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.warn("API unreachable, using minimal mock data as fallback");
      return {
        totalParticipants: 0,
        totalPoints: 0
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
    const response = await axios.get<ParticipantUploadAudit[]>(
      `${API_URL}/admin/participants/uploads`,
      {
        headers: getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error: unknown) {
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
    const response = await axios.get<{ data: ParticipantData[], total: number, page: number, totalPages: number }>(
      `${API_URL}/admin/participants?drawDate=${drawDate}&page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error: unknown) {
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
    const response = await axios.delete<{ message: string }>(
      `${API_URL}/admin/participants/uploads/${auditId}`,
      {
        headers: getAuthHeaders(token),
      }
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
