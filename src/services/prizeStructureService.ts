// src/services/prizeStructureService.ts
import axios from "axios";
import { apiClient } from './apiClient';
import { MOCK_MODE } from './apiClient';

// --- Types for GET responses (data received from backend) ---
export interface ServicePrizeTierData { // Represents a single prize tier as returned by GET
  id?: string;
  name: string;
  prizeType: string; // Changed to camelCase to match backend response
  valueNGN?: number; 
  value: string; // This is the display string like "N1,000,000"
  quantity: number; // Changed from winnerCount to match backend
  order: number;
  numberOfRunnerUps: number;
}

export interface ServicePrizeStructureData { // Represents a prize structure as returned by GET
  id?: string;
  name: string;
  description: string;
  isActive: boolean; // Changed to camelCase to match backend response
  validFrom: string; // Changed to camelCase to match backend response
  validTo?: string | null; // Changed to camelCase to match backend response
  prizes: ServicePrizeTierData[]; // Changed from prizeTiers to match backend field name
  createdAt?: string; // Changed to camelCase to match backend response
  updatedAt?: string; // Changed to camelCase to match backend response
  applicableDays?: string[]; // Changed to camelCase to match backend response
  dayType?: string; // Changed to camelCase to match backend response
}

// --- Types for POST/PUT payloads (data sent to backend) ---
// Matches backend models.CreatePrizeRequest JSON tags
export interface CreatePrizeTierPayload {
  name: string;
  value: string; 
  prize_type: string; 
  quantity: number; 
  order: number; 
  number_of_runner_ups: number; // Changed to snake_case for backend request
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

const listPrizeStructures = async (token: string | null): Promise<ServicePrizeStructureData[]> => {
  try {
    const response = await apiClient.get<ServicePrizeStructureData[]>(
      `/admin/prize-structures/`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    console.log("Raw API response from listPrizeStructures:", response.data);
    
    // Transform the response to match our expected format
    const transformedData = response.data.map(item => {
      // Map prizes array from backend format to our ServicePrizeTierData format
      const transformedPrizes = (item.prizes || []).map(prize => ({
        id: prize.id,
        name: prize.name,
        prizeType: prize.prizeType, // Using camelCase for frontend
        value: prize.value,
        valueNGN: parseInt(prize.value?.replace(/[^0-9]/g, '') || '0'),
        quantity: prize.quantity,
        order: prize.order,
        numberOfRunnerUps: prize.numberOfRunnerUps
      }));
      
      return {
        ...item,
        // Ensure these fields exist even if backend doesn't provide them
        applicableDays: item.applicableDays || [],
        prizes: transformedPrizes
      };
    });
    
    return transformedData;
  } catch (error: unknown) {
    if (MOCK_MODE) {
      console.warn("Using mock prize structure data due to API error:", error);
      return []; // Return empty array as mock data
    }
    
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
    const response = await apiClient.post<ServicePrizeStructureData>(
      `/admin/prize-structures/`, 
      payload,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    console.log("Raw API response from createPrizeStructure:", response.data);
    
    // Transform the response to match our expected format
    const transformedPrizes = (response.data.prizes || []).map(prize => ({
      id: prize.id,
      name: prize.name,
      prizeType: prize.prizeType, // Using camelCase for frontend
      value: prize.value,
      valueNGN: parseInt(prize.value?.replace(/[^0-9]/g, '') || '0'),
      quantity: prize.quantity,
      order: prize.order,
      numberOfRunnerUps: prize.numberOfRunnerUps
    }));
    
    return {
      ...response.data,
      applicableDays: response.data.applicableDays || [],
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
    const response = await apiClient.get<ServicePrizeStructureData>(
      `/admin/prize-structures/${id}/`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    console.log("Raw API response from getPrizeStructure:", response.data);
    
    // Transform the response to match our expected format
    const transformedPrizes = (response.data.prizes || []).map(prize => ({
      id: prize.id,
      name: prize.name,
      prizeType: prize.prizeType, // Using camelCase for frontend
      value: prize.value,
      valueNGN: parseInt(prize.value?.replace(/[^0-9]/g, '') || '0'),
      quantity: prize.quantity,
      order: prize.order,
      numberOfRunnerUps: prize.numberOfRunnerUps
    }));
    
    return {
      ...response.data,
      applicableDays: response.data.applicableDays || [],
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
    const response = await apiClient.put<ServicePrizeStructureData>(
      `/admin/prize-structures/${id}/`, 
      payload,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    console.log("Raw API response from updatePrizeStructure:", response.data);
    
    // Transform the response to match our expected format
    const transformedPrizes = (response.data.prizes || []).map(prize => ({
      id: prize.id,
      name: prize.name,
      prizeType: prize.prizeType, // Using camelCase for frontend
      value: prize.value,
      valueNGN: parseInt(prize.value?.replace(/[^0-9]/g, '') || '0'),
      quantity: prize.quantity,
      order: prize.order,
      numberOfRunnerUps: prize.numberOfRunnerUps
    }));
    
    return {
      ...response.data,
      applicableDays: response.data.applicableDays || [],
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
    const response = await apiClient.delete<{ message: string }>(
      `/admin/prize-structures/${id}/`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
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
