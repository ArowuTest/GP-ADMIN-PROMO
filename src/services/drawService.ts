// src/services/drawService.ts
import axios from 'axios';
import { apiClient } from './apiClient';
import { MOCK_MODE } from './apiClient';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Define interfaces for draw-related data structures
export interface ExecuteDrawRequestData {
  drawDate: string; // ISO Date string (e.g., "2023-10-26T00:00:00Z")
  prizeStructureID: string;
}

export interface DrawData {
  id: string;
  drawDate: string;
  prizeStructureID: string;
  prizeStructure?: any; // Optional: populated by Preload
  status: string; // e.g., "Pending", "Completed", "Failed"
  totalEligibleMSISDNs: number;
  totalEntries: number;
  executedByAdminID: string;
  executedByAdmin?: any; // Optional: populated by Preload
  winners?: WinnerData[]; // Optional: populated by Preload
  createdAt: string;
  updatedAt: string;
}

export interface WinnerData {
  id: string;
  drawID: string;
  msisdn: string;
  prizeTierID: string;
  prizeTier?: any; // Optional: populated by Preload
  status: string; // e.g., "PendingNotification", "Notified", "Confirmed"
  paymentStatus?: string; // e.g., "Pending", "Paid", "Failed"
  paymentNotes?: string;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DrawEligibilityStats {
  totalEligibleMSISDNs: number;
  totalEntries: number;
}

const getAuthHeaders = (token: string | null) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get eligibility statistics for a draw on a specific date
 * This fetches the number of eligible participants and total entries for a draw
 */
const getDrawEligibilityStats = async (
  drawDate: string,
  token: string | null
): Promise<DrawEligibilityStats> => {
  try {
    const response = await apiClient.get<DrawEligibilityStats>(
      `/admin/draws/eligibility-stats?drawDate=${drawDate}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error: unknown) {
    // If the API endpoint doesn't exist yet or returns an error, return mock data
    // This allows development to continue while the backend is being implemented
    console.warn("Using mock eligibility stats due to API error:", error);
    return {
      totalEligibleMSISDNs: Math.floor(Math.random() * 10000) + 500,
      totalEntries: Math.floor(Math.random() * 100000) + 5000
    };
  }
};

// Execute a draw
const executeDraw = async (
  drawDate: string,
  prizeStructureId: string,
  token: string | null
): Promise<{ message: string; draw: DrawData }> => {
  const data: ExecuteDrawRequestData = {
    drawDate,
    prizeStructureID: prizeStructureId
  };

  try {
    const response = await axios.post<{ message: string; draw: DrawData }>(
      `${API_URL}/admin/draws/execute`,
      data,
      {
        headers: getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = 'Failed to execute draw due to server error.';
      throw new Error(typeof apiError === 'string' && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || 'Failed to execute draw due to an unexpected error.');
    } else {
      throw new Error('Failed to execute draw due to an unexpected error.');
    }
  }
};

// List all draws
const listDraws = async (token: string | null): Promise<DrawData[]> => {
  try {
    const response = await axios.get<DrawData[]>(`${API_URL}/admin/draws`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (MOCK_MODE) {
      console.warn("Using mock draw list data due to API error:", error);
      return []; // Return empty array as mock data
    }
    
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = 'Failed to fetch draws due to server error.';
      throw new Error(typeof apiError === 'string' && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || 'Failed to fetch draws due to an unexpected error.');
    } else {
      throw new Error('Failed to fetch draws due to an unexpected error.');
    }
  }
};

// Get details of a single draw
const getDrawDetails = async (id: string, token: string | null): Promise<DrawData> => {
  try {
    const response = await axios.get<DrawData>(`${API_URL}/admin/draws/${id}`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = 'Failed to fetch draw details due to server error.';
      throw new Error(typeof apiError === 'string' && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || 'Failed to fetch draw details due to an unexpected error.');
    } else {
      throw new Error('Failed to fetch draw details due to an unexpected error.');
    }
  }
};

// List all winners (can be filtered by drawId, etc. on backend)
const listWinners = async (token: string | null, drawId?: string): Promise<WinnerData[]> => {
  try {
    let url = `${API_URL}/admin/winners`;
    if (drawId) {
      // Assuming backend supports filtering by draw_id, adjust if needed
      // url += `?draw_id=${drawId}`;
    }
    const response = await axios.get<WinnerData[]>(url, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error: unknown) {
    if (MOCK_MODE) {
      console.warn("Using mock winners data due to API error:", error);
      return []; // Return empty array as mock data
    }
    
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = 'Failed to fetch winners due to server error.';
      throw new Error(typeof apiError === 'string' && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || 'Failed to fetch winners due to an unexpected error.');
    } else {
      throw new Error('Failed to fetch winners due to an unexpected error.');
    }
  }
};

// Update winner payment status
const updateWinnerPaymentStatus = async (
  winnerId: string,
  paymentStatus: string,
  notes: string | undefined,
  token: string | null
): Promise<WinnerData> => {
  try {
    const response = await axios.put<WinnerData>(
      `${API_URL}/admin/winners/${winnerId}/payment-status`,
      { paymentStatus, notes },
      {
        headers: getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = 'Failed to update winner payment status due to server error.';
      throw new Error(typeof apiError === 'string' && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || 'Failed to update winner payment status due to an unexpected error.');
    } else {
      throw new Error('Failed to update winner payment status due to an unexpected error.');
    }
  }
};

export const drawService = {
  getDrawEligibilityStats,
  executeDraw,
  listDraws,
  getDrawDetails,
  listWinners,
  updateWinnerPaymentStatus,
};
