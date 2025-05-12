import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const getAuthHeaders = (token: string | null) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface UploadResponse {
  message: string;
  audit_id: string;
  status: string;
  total_data_rows_processed: number;
  successful_rows_imported: number;
  errors: string[];
}

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
      // Assuming the backend sends a similar error structure for upload failures
      // or a generic error message
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

export const participantService = {
  uploadParticipantData,
};

