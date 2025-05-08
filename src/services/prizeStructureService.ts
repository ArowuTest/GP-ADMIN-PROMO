import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // To get the token

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// TODO: Define proper types for PrizeStructure and PrizeTier based on backend models
// For now, using 'any' as placeholders.

export interface PrizeTierData {
  id?: string;
  name: string;
  prizeType: string; // e.g., "Cash", "Airtime"
  valueNGN: number;
  winnerCount: number;
  order: number;
}

export interface PrizeStructureData {
  id?: string;
  name: string;
  description: string;
  isActive: boolean;
  validFrom: string; // ISO Date string
  validTo?: string | null; // ISO Date string or null
  prizeTiers: PrizeTierData[];
  createdAt?: string;
  updatedAt?: string;
}

const getAuthHeaders = (token: string | null) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all prize structures
const listPrizeStructures = async (token: string | null): Promise<PrizeStructureData[]> => {
  try {
    const response = await axios.get<PrizeStructureData[]>(`${API_URL}/admin/prize-structures`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch prize structures');
    }
    throw new Error('Failed to fetch prize structures due to an unexpected error.');
  }
};

// Create a new prize structure
const createPrizeStructure = async (data: Omit<PrizeStructureData, 'id' | 'createdAt' | 'updatedAt'>, token: string | null): Promise<PrizeStructureData> => {
  try {
    const response = await axios.post<PrizeStructureData>(`${API_URL}/admin/prize-structures`, data, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to create prize structure');
    }
    throw new Error('Failed to create prize structure due to an unexpected error.');
  }
};

// Get a single prize structure by ID
const getPrizeStructure = async (id: string, token: string | null): Promise<PrizeStructureData> => {
  try {
    const response = await axios.get<PrizeStructureData>(`${API_URL}/admin/prize-structures/${id}`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch prize structure');
    }
    throw new Error('Failed to fetch prize structure due to an unexpected error.');
  }
};

// Update a prize structure
const updatePrizeStructure = async (id: string, data: Partial<Omit<PrizeStructureData, 'id' | 'createdAt' | 'updatedAt' | 'prizeTiers'>>, token: string | null): Promise<PrizeStructureData> => {
  // Note: Backend currently doesn't support updating tiers via this endpoint directly.
  try {
    const response = await axios.put<PrizeStructureData>(`${API_URL}/admin/prize-structures/${id}`, data, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to update prize structure');
    }
    throw new Error('Failed to update prize structure due to an unexpected error.');
  }
};

// Activate/Deactivate a prize structure
const activatePrizeStructure = async (id: string, isActive: boolean, token: string | null): Promise<PrizeStructureData> => {
  try {
    const response = await axios.put<PrizeStructureData>(`${API_URL}/admin/prize-structures/${id}/activate`, { isActive }, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to update prize structure status');
    }
    throw new Error('Failed to update prize structure status due to an unexpected error.');
  }
};

// Delete a prize structure
const deletePrizeStructure = async (id: string, token: string | null): Promise<{ message: string }> => {
  try {
    const response = await axios.delete<{ message: string }>(`${API_URL}/admin/prize-structures/${id}`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to delete prize structure');
    }
    throw new Error('Failed to delete prize structure due to an unexpected error.');
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

