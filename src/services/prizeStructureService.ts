// src/services/prizeStructureService.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// --- Types for GET responses (data received from backend) ---
export interface ServicePrizeTierData { // Represents a single prize tier as returned by GET
  id?: string;
  name: string;
  prizeType: string;
  valueNGN?: number; 
  value: string; // This is the display value like "N1,000,000"
  winnerCount: number; 
  order: number;
  numberOfRunnerUps: number;
}

export interface ServicePrizeStructureData { // Represents a prize structure as returned by GET
  id?: string;
  name: string;
  description: string;
  is_active: boolean; // Changed from isActive to match backend field name
  valid_from: string; // Changed from validFrom to match backend field name
  valid_to?: string | null; // Changed from validTo to match backend field name
  prizes: ServicePrizeTierData[]; // Changed from prizeTiers to match backend field name
  created_at?: string; // Changed from createdAt to match backend field name
  updated_at?: string; // Changed from updatedAt to match backend field name
  applicable_days?: string[]; // Backend sends this in GET response
  day_type?: string; // Backend might send this in GET response if it stores it
}

// --- Types for POST/PUT payloads (data sent to backend) ---
// Matches backend models.CreatePrizeRequest JSON tags
export interface CreatePrizeTierPayload {
  name: string;
  value: string; 
  prize_type: string; 
  quantity: number; 
  order: number; 
  numberOfRunnerUps: number; 
}

// Matches backend CreatePrizeStructureRequest JSON tags
export interface CreatePrizeStructurePayload { 
  name: string;
  description: string;
  is_active: boolean; 
  valid_from: string; 
  valid_to?: string | null; 
  prizes: CreatePrizeTierPayload[]; 
  applicable_days?: string[]; // Backend will derive day_type from this
}

const getAuthHeaders = (token: string | null) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const listPrizeStructures = async (token: string | null): Promise<ServicePrizeStructureData[]> => {
  try {
    const response = await axios.get<ServicePrizeStructureData[]>(`${API_URL}/admin/prize-structures/`, {
      headers: getAuthHeaders(token),
    });
    console.log("Raw API response from listPrizeStructures:", response.data);
    
    // Transform the response to match our expected format
    const transformedData = response.data.map(item => {
      // Map prizes array from backend format to our ServicePrizeTierData format
      const transformedPrizes = (item.prizes || []).map(prize => ({
        id: prize.id,
        name: prize.name,
        prizeType: prize.prize_type || prize.prizeType,
        value: prize.value,
        valueNGN: parseInt(prize.value?.replace(/[^0-9]/g, '') || '0'),
        winnerCount: prize.quantity || prize.winnerCount,
        order: prize.order,
        numberOfRunnerUps: prize.numberOfRunnerUps
      }));
      
      return {
        ...item,
        // Ensure these fields exist even if backend doesn't provide them
        applicable_days: item.applicable_days || [],
        prizes: transformedPrizes
      };
    });
    
    return transformedData;
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
    console.log("Sending payload to createPrizeStructure:", JSON.stringify(payload, null, 2));
    const response = await axios.post<ServicePrizeStructureData>(`${API_URL}/admin/prize-structures/`, payload, {
      headers: getAuthHeaders(token),
    });
    console.log("Raw API response from createPrizeStructure:", response.data);
    
    // Transform the response to match our expected format
    const transformedPrizes = (response.data.prizes || []).map(prize => ({
      id: prize.id,
      name: prize.name,
      prizeType: prize.prize_type || prize.prizeType,
      value: prize.value,
      valueNGN: parseInt(prize.value?.replace(/[^0-9]/g, '') || '0'),
      winnerCount: prize.quantity || prize.winnerCount,
      order: prize.order,
      numberOfRunnerUps: prize.numberOfRunnerUps
    }));
    
    return {
      ...response.data,
      applicable_days: response.data.applicable_days || [],
      prizes: transformedPrizes
    };
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
    console.log("Raw API response from getPrizeStructure:", response.data);
    
    // Transform the response to match our expected format
    const transformedPrizes = (response.data.prizes || []).map(prize => ({
      id: prize.id,
      name: prize.name,
      prizeType: prize.prize_type || prize.prizeType,
      value: prize.value,
      valueNGN: parseInt(prize.value?.replace(/[^0-9]/g, '') || '0'),
      winnerCount: prize.quantity || prize.winnerCount,
      order: prize.order,
      numberOfRunnerUps: prize.numberOfRunnerUps
    }));
    
    return {
      ...response.data,
      applicable_days: response.data.applicable_days || [],
      prizes: transformedPrizes
    };
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
    console.log(`Sending payload to updatePrizeStructure for ID ${id}:`, JSON.stringify(payload, null, 2));
    const response = await axios.put<ServicePrizeStructureData>(`${API_URL}/admin/prize-structures/${id}/`, payload, {
      headers: getAuthHeaders(token),
    });
    console.log("Raw API response from updatePrizeStructure:", response.data);
    
    // Transform the response to match our expected format
    const transformedPrizes = (response.data.prizes || []).map(prize => ({
      id: prize.id,
      name: prize.name,
      prizeType: prize.prize_type || prize.prizeType,
      value: prize.value,
      valueNGN: parseInt(prize.value?.replace(/[^0-9]/g, '') || '0'),
      winnerCount: prize.quantity || prize.winnerCount,
      order: prize.order,
      numberOfRunnerUps: prize.numberOfRunnerUps
    }));
    
    return {
      ...response.data,
      applicable_days: response.data.applicable_days || [],
      prizes: transformedPrizes
    };
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
  deletePrizeStructure,
};
