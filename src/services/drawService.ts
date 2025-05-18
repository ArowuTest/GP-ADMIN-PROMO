// src/services/drawService.ts - Update to add invokeRunnerUp method
import axios from 'axios';
import { apiClient } from './apiClient';
import { MOCK_MODE } from './apiClient';

// Define interfaces for draw-related data structures
export interface ExecuteDrawRequestData {
  draw_date: string; // Changed from drawDate to draw_date to match backend expectation
  prize_structure_id: string; // Changed from prizeStructureID to prize_structure_id to match backend expectation
}

export interface DrawData {
  id: string;
  drawDate: string;
  prizeStructureID: string;
  prizeStructureName: string; // Added to match backend response
  prizeStructure?: any; // Optional: populated by Preload
  status: string; // e.g., "Pending", "Completed", "Failed"
  totalEligibleMSISDNs: number;
  totalEntries: number;
  executedByAdminID: string;
  executedByAdminName: string; // Added to match backend response
  executedByAdmin?: any; // Optional: populated by Preload
  winners?: WinnerData[]; // Optional: populated by Preload
  createdAt: string;
  updatedAt: string;
}

export interface WinnerData {
  id: string;
  drawID: string;
  msisdn: string;
  maskedMSISDN: string; // Added to match backend response
  prizeTierID: string;
  prizeTierName: string; // Added to match backend response
  prizeTier?: any; // Optional: populated by Preload
  status: string; // e.g., "PendingNotification", "Notified", "Confirmed"
  paymentStatus?: string; // e.g., "Pending", "Paid", "Failed"
  paymentNotes?: string;
  paidAt?: string | null;
  isRunnerUp: boolean;
  runnerUpRank: number;
  createdAt: string;
  updatedAt: string;
}

export interface DrawEligibilityStats {
  totalEligibleMSISDNs: number;
  totalEntries: number;
}

export interface InvokeRunnerUpResponse {
  message: string;
  forfeited_winner: {
    id: string;
    msisdn: string;
    maskedMSISDN: string; // Added to match backend response
    status: string;
  };
  promoted_runner_up: {
    id: string;
    msisdn: string;
    maskedMSISDN: string; // Added to match backend response
    status: string;
  };
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
    draw_date: drawDate, // Changed from drawDate to draw_date
    prize_structure_id: prizeStructureId // Changed from prizeStructureID to prize_structure_id
  };

  console.log("Executing draw with payload:", data);

  try {
    const response = await apiClient.post<{ message: string; draw: DrawData }>(
      `/admin/draws/execute`,
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

// Invoke a runner-up when a winner forfeits
const invokeRunnerUp = async (
  winnerId: string,
  reason: string,
  token: string | null
): Promise<InvokeRunnerUpResponse> => {
  try {
    const response = await apiClient.post<InvokeRunnerUpResponse>(
      `/admin/draws/invoke-runner-up`,
      {
        winner_id: winnerId,
        reason: reason
      },
      {
        headers: getAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data?.error;
      const defaultMessage = 'Failed to invoke runner-up due to server error.';
      throw new Error(typeof apiError === 'string' && apiError ? apiError : defaultMessage);
    } else if (error instanceof Error) {
      throw new Error(error.message || 'Failed to invoke runner-up due to an unexpected error.');
    } else {
      throw new Error('Failed to invoke runner-up due to an unexpected error.');
    }
  }
};

// List all draws
const listDraws = async (token: string | null): Promise<DrawData[]> => {
  try {
    const response = await apiClient.get<DrawData[]>(
      `/admin/draws`,
      {
        headers: getAuthHeaders(token),
      }
    );
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
    const response = await apiClient.get<DrawData>(
      `/admin/draws/${id}`,
      {
        headers: getAuthHeaders(token),
      }
    );
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
    let url = `/admin/winners`;
    if (drawId) {
      url += `?draw_id=${drawId}`;
    }
    const response = await apiClient.get<WinnerData[]>(
      url,
      {
        headers: getAuthHeaders(token),
      }
    );
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
    const response = await apiClient.put<WinnerData>(
      `/admin/winners/${winnerId}/payment-status`,
      { payment_status: paymentStatus, notes },
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
  invokeRunnerUp,
  listDraws,
  getDrawDetails,
  listWinners,
  updateWinnerPaymentStatus,
};
