// src/services/prizeStructureService.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// --- Types for GET responses (data received from backend) ---
export interface ServicePrizeTierData { // Represents a single prize tier as returned by GET
  id?: string;
  name: string;
  prizeType: string;
  valueNGN: number; // Backend sends this in GET response (from Prize model)
  value?: string; // Backend might also send display value
  winnerCount: number; // Backend sends this as winnerCount (from Prize model, maps to Quantity)
  order: number;
  numberOfRunnerUps: number;
}

export interface ServicePrizeStructureData { // Represents a prize structure as returned by GET
  id?: string;
  name: string;
  description: string;
  isActive: boolean;
  validFrom: string;
  validTo?: string | null;
  prizeTiers: ServicePrizeTierData[]; // Backend GET responses use 'prizeTiers'
  createdAt?: string;
  updatedAt?: string;
  applicableDays?: string[]; // Backend sends this in GET response
}

// --- Types for POST/PUT payloads (data sent to backend) ---
// Matches backend models.CreatePrizeRequest JSON tags
export interface CreatePrizeTierPayload {
  name: string;
  value: string; // Corresponds to models.CreatePrizeRequest.Value (json:"value")
  prize_type: string; // Corresponds to models.CreatePrizeRequest.PrizeType (json:"prize_type")
  quantity: number; // Corresponds to models.CreatePrizeRequest.Quantity (json:"quantity")
  order: number; // Corresponds to models.CreatePrizeRequest.Order (json:"order")
  numberOfRunnerUps: number; // Corresponds to models.CreatePrizeRequest.NumberOfRunnerUps (json:"numberOfRunnerUps")
}

// Matches backend CreatePrizeStructureRequest JSON tags
export interface CreatePrizeStructurePayload { 
  name: string;
  description: string;
  is_active: boolean; // Corresponds to backend json:"is_active"
  valid_from: string; // Corresponds to backend json:"valid_from"
  valid_to?: string | null; // Corresponds to backend json:"valid_to"
  prizes: CreatePrizeTierPayload[]; // Corresponds to backend json:"prizes"
  // applicable_days is NOT part of the backend CreatePrizeStructureRequest struct
}

const getAuthHeaders = (token: string | null) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const listPrizeStructures = async (token: string | null): Promise<ServicePrizeStructureData[]> => {
  try {
    const response = await axios.get<ServicePrizeStructureData[]>(`${API_URL}/admin/prize-structures/`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching prize structures:", error);
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to fetch prize structures due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to fetch prize structures due to an unexpected error.");
    } else {
      throw new Error("Failed to fetch prize structures due to an unexpected error.");
    }
  }
};

const createPrizeStructure = async (payload: CreatePrizeStructurePayload, token: string | null): Promise<ServicePrizeStructureData> => {
  try {
    const response = await axios.post<ServicePrizeStructureData>(`${API_URL}/admin/prize-structures/`, payload, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = `Failed to create prize structure: ${typeof apiError === "string" && apiError ? apiError : "Invalid request payload or server error."}`;
      console.error("Full error creating prize structure:", error.response.data);
      throw new Error(defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to create prize structure due to an unexpected error.");
    } else {
      throw new Error("Failed to create prize structure due to an unexpected error.");
    }
  }
};

const getPrizeStructure = async (id: string, token: string | null): Promise<ServicePrizeStructureData> => {
  try {
    const response = await axios.get<ServicePrizeStructureData>(`${API_URL}/admin/prize-structures/${id}/`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to fetch prize structure due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to fetch prize structure due to an unexpected error.");
    } else {
      throw new Error("Failed to fetch prize structure due to an unexpected error.");
    }
  }
};

const updatePrizeStructure = async (id: string, payload: Partial<CreatePrizeStructurePayload>, token: string | null): Promise<ServicePrizeStructureData> => {
  try {
    const response = await axios.put<ServicePrizeStructureData>(`${API_URL}/admin/prize-structures/${id}/`, payload, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = `Failed to update prize structure: ${typeof apiError === "string" && apiError ? apiError : "Invalid request payload or server error."}`;
      console.error("Full error updating prize structure:", error.response.data);
      throw new Error(defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to update prize structure due to an unexpected error.");
    } else {
      throw new Error("Failed to update prize structure due to an unexpected error.");
    }
  }
};

const deletePrizeStructure = async (id: string, token: string | null): Promise<{ message: string }> => {
  try {
    const response = await axios.delete<{ message: string }>(`${API_URL}/admin/prize-structures/${id}/`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to delete prize structure due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to delete prize structure due to an unexpected error.");
    } else {
      throw new Error("Failed to delete prize structure due to an unexpected error.");
    }
  }
};

export const prizeStructureService = {
  listPrizeStructures,
  createPrizeStructure,
  getPrizeStructure,
  updatePrizeStructure,
  // activatePrizeStructure, // This function was not fully defined or used previously, commenting out.
  deletePrizeStructure,
};

