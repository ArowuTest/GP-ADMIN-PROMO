import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export interface DataUploadAudit {
  id: string;
  uploaded_by_user_id: string;
  file_name: string;
  record_count: number;
  successfully_imported: number;
  duplicates_skipped: number;
  errors_encountered: number;
  status: string;
  notes: string;
  operation_type: string;
  upload_timestamp: string; // Assuming ISO 8601 date string
  // Add other fields as necessary based on the actual backend model
}

export const getDataUploadAudits = async (token: string): Promise<DataUploadAudit[]> => {
  try {
    const response = await axios.get(`${API_URL}/admin/reports/data-uploads/`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data as DataUploadAudit[];
  } catch (error) {
    console.error("Error fetching data upload audits:", error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      throw new Error("Unauthorized: Please log in again.");
    }
    throw new Error("Failed to fetch data upload audits.");
  }
};

