// src/services/prizeService.ts
import { apiClient } from './apiClient';

// Define DayOfWeek type here to avoid circular imports
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

// Define types for prize structure-related data
export interface PrizeTierPayload {
  id?: string;
  name: string;
  prize_type: string;
  value: string;
  quantity: number;
  order: number;
  number_of_runner_ups: number;
}

export interface CreatePrizeStructurePayload {
  name: string;
  description: string;
  is_active: boolean;
  valid_from: string;
  valid_to?: string | null;
  prizes: PrizeTierPayload[];
  applicable_days: DayOfWeek[];
}

// Define PrizeStructureCreateRequest as an alias of CreatePrizeStructurePayload
export type PrizeStructureCreateRequest = CreatePrizeStructurePayload;

export interface PrizeStructureResponse {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  validFrom: string;
  validTo: string | null;
  prizes: {
    id: string;
    name: string;
    prizeType: string;
    value: string;
    valueNGN: string;
    quantity: number;
    order: number;
    numberOfRunnerUps: number;
  }[];
  applicableDays: DayOfWeek[];
  createdAt: string;
  updatedAt: string;
}

// Export these types for use in other components
export interface ServicePrizeStructureData extends PrizeStructureResponse {}
export interface ServicePrizeTierData {
  id: string;
  name: string;
  prizeType: string;
  value: string;
  valueNGN: string;
  quantity: number;
  order: number;
  numberOfRunnerUps: number;
}

// List all prize structures
const listPrizeStructures = async (token: string): Promise<PrizeStructureResponse[]> => {
  try {
    const response = await apiClient.get('/admin/prize-structures', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error listing prize structures:', error);
    throw error;
  }
};

// Get a specific prize structure by ID
const getPrizeStructure = async (id: string, token: string): Promise<PrizeStructureResponse> => {
  try {
    const response = await apiClient.get(`/admin/prize-structures/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error getting prize structure ${id}:`, error);
    throw error;
  }
};

// Create a new prize structure
const createPrizeStructure = async (data: PrizeStructureCreateRequest, token: string): Promise<PrizeStructureResponse> => {
  try {
    console.log('[PRIZE_SERVICE] Creating prize structure:', data);
    const response = await apiClient.post('/admin/prize-structures', data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('[PRIZE_SERVICE] Create prize structure response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating prize structure:', error);
    throw error;
  }
};

// Update an existing prize structure
const updatePrizeStructure = async (id: string, payload: Partial<CreatePrizeStructurePayload>, token: string): Promise<PrizeStructureResponse> => {
  try {
    const response = await apiClient.put(`/admin/prize-structures/${id}`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating prize structure ${id}:`, error);
    throw error;
  }
};

// Delete a prize structure
const deletePrizeStructure = async (id: string, token: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete(`/admin/prize-structures/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting prize structure ${id}:`, error);
    throw error;
  }
};

export const prizeService = {
  listPrizeStructures,
  getPrizeStructure,
  createPrizeStructure,
  updatePrizeStructure,
  deletePrizeStructure
};
