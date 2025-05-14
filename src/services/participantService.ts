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
  successfully_imported_rows: number; // Corrected field name from successful_rows_imported
  duplicates_skipped_count: number;   // Added this field
  processing_error_messages: string[]; // Aligned with backend field name (was errors)
  skipped_duplicate_event_details: string[]; // Added this field
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
      const errorData = error.response.data as Partial<UploadResponse>; // Type assertion
      // Prefer specific error messages from backend if available
      let errorMessage = "Failed to upload participant data";
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.processing_error_messages && errorData.processing_error_messages.length > 0) {
        errorMessage = errorData.processing_error_messages.join("; ");
      } else if (error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
    throw new Error("An unexpected error occurred during participant data upload");
  }
};

export const participantService = {
  uploadParticipantData,
};
