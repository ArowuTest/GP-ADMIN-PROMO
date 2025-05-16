// src/services/prizeStructureService.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// --- Types for GET responses (data received from backend) ---
export interface ServicePrizeTierData { // Represents a single prize tier as returned by GET
  id?: string;
  name: string;
  prizeType: string;
  valueNGN: number;
  winnerCount: number;
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
  applicableDays?: string[];
}

// --- Types for POST/PUT payloads (data sent to backend) ---
export interface CreatePrizeTierPayload { // Fields for a prize tier when creating/updating a structure
  name: string;
  prizeType: string;
  valueNGN: number;
  winnerCount: number;
  order: number;
  numberOfRunnerUps: number;
}

export interface CreatePrizeStructurePayload { // Payload for creating/updating a prize structure
  name: string;
  description: string;
  isActive: boolean;
  validFrom: string;
  validTo?: string | null;
  prizes: CreatePrizeTierPayload[]; // Backend POST/PUT requests expect 'prizes'
  applicableDays?: string[];
}

const getAuthHeaders = (token: string | null) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all prize structures
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

// Create a new prize structure
const createPrizeStructure = async (payload: CreatePrizeStructurePayload, token: string | null): Promise<ServicePrizeStructureData> => {
  try {
    // Ensure each prize tier in the 'prizes' array has numberOfRunnerUps defaulted if necessary
    const payloadToSend = {
      ...payload,
      prizes: payload.prizes.map(tier => ({
        ...tier,
        numberOfRunnerUps: tier.numberOfRunnerUps !== undefined ? tier.numberOfRunnerUps : 1,
      })),
    };
    // The backend expects 'prizes' field in the payload, which payloadToSend now has.
    const response = await axios.post<ServicePrizeStructureData>(`${API_URL}/admin/prize-structures/`, payloadToSend, {
      headers: getAuthHeaders(token),
    });
    // The response from the backend (ServicePrizeStructureData) might use 'prizeTiers', so the return type is correct.
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

// Get a single prize structure by ID
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

// Update a prize structure
const updatePrizeStructure = async (id: string, payload: Partial<CreatePrizeStructurePayload>, token: string | null): Promise<ServicePrizeStructureData> => {
  try {
    const payloadToSend = { ...payload };
    if (payload.prizes) {
      payloadToSend.prizes = payload.prizes.map(tier => ({
        ...tier,
        numberOfRunnerUps: tier.numberOfRunnerUps !== undefined ? tier.numberOfRunnerUps : 1,
      }));
    }
    const response = await axios.put<ServicePrizeStructureData>(`${API_URL}/admin/prize-structures/${id}/`, payloadToSend, {
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

// Activate/Deactivate a prize structure
const activatePrizeStructure = async (id: string, isActive: boolean, token: string | null): Promise<ServicePrizeStructureData> => {
  try {
    const response = await axios.put<ServicePrizeStructureData>(`${API_URL}/admin/prize-structures/${id}/activate/`, { isActive }, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = "Failed to update prize structure status due to server error.";
      throw new Error(typeof apiError === "string" && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || "Failed to update prize structure status due to an unexpected error.");
    } else {
      throw new Error("Failed to update prize structure status due to an unexpected error.");
    }
  }
};

// Delete a prize structure
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
  activatePrizeStructure,
  deletePrizeStructure,
};

