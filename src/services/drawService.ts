// src/services/drawService.ts
import { apiClient, getAuthHeaders } from './apiClient';

// Define types for draw-related data
export interface DrawData {
  id: string;
  drawDate: string;
  status: string;
  prizeStructureId: string;
  prizeStructureName: string;
  executedByAdminID: string;
  totalEligibleMSISDNs: number;
  totalEntries: number;
  draw: any; // Added to support draw property access
  message?: string; // Added for error messages
  createdAt: string;
  updatedAt: string;
  winners: WinnerData[];
}

export interface WinnerData {
  id: string;
  drawId: string;
  drawID: string; // Added for backward compatibility
  msisdn: string;
  prizeTierId: string;
  prizeTierID: string; // Added for backward compatibility
  prizeTierName: string;
  prizeTier: string; // Added for backward compatibility
  prizeValue: string;
  status: string;
  paymentStatus: string;
  paymentNotes: string; // Added missing property
  isRunnerUp: boolean;
  originalWinnerId?: string;
  runnerUpRank?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityStats {
  totalEligibleParticipants: number;
  totalEligibleEntries: number;
  totalEligibleMSISDNs: number;
  totalEntries: number;
  participantsByPoints: {
    points: number;
    count: number;
  }[];
}

export interface RunnerUpInvocationResult {
  message: string;
  originalWinner: WinnerData;
  newWinner: WinnerData;
}

// List all draws
const listDraws = async (token: string): Promise<DrawData[]> => {
  try {
    const response = await apiClient.get('/admin/draws', {
      headers: getAuthHeaders(token)
    });
    // Handle nested response structure
    return response.data.data || [];
  } catch (error) {
    console.error('Error listing draws:', error);
    throw error;
  }
};

// Get a specific draw by ID
const getDrawById = async (id: string, token: string): Promise<DrawData> => {
  try {
    const response = await apiClient.get(`/admin/draws/${id}`, {
      headers: getAuthHeaders(token)
    });
    // Handle nested response structure
    return response.data.data;
  } catch (error) {
    console.error(`Error getting draw ${id}:`, error);
    throw error;
  }
};

// List all winners
const listWinners = async (token: string): Promise<WinnerData[]> => {
  try {
    const response = await apiClient.get('/admin/winners', {
      headers: getAuthHeaders(token)
    });
    // Handle nested response structure
    return response.data.data || [];
  } catch (error) {
    console.error('Error listing winners:', error);
    throw error;
  }
};

// Execute a new draw
const executeDraw = async (drawDate: string, prizeStructureId: string, token: string): Promise<DrawData> => {
  try {
    const response = await apiClient.post('/admin/draws/execute', {
      draw_date: drawDate,
      prize_structure_id: prizeStructureId
    }, {
      headers: getAuthHeaders(token)
    });
    // Handle nested response structure
    return response.data.data;
  } catch (error) {
    console.error('Error executing draw:', error);
    throw error;
  }
};

// Get eligibility statistics for a potential draw
const getEligibilityStats = async (date: string, token: string): Promise<EligibilityStats> => {
  try {
    const response = await apiClient.get('/admin/draws/eligibility-stats', {
      params: { date },
      headers: getAuthHeaders(token)
    });
    // Handle nested response structure
    return response.data.data;
  } catch (error) {
    console.error('Error getting eligibility stats:', error);
    throw error;
  }
};

// Alias for getEligibilityStats to maintain backward compatibility
const getDrawEligibilityStats = getEligibilityStats;

// Update winner payment status
const updateWinnerPaymentStatus = async (winnerId: string, paymentStatus: string, token: string): Promise<WinnerData> => {
  try {
    const response = await apiClient.put(`/admin/winners/${winnerId}/payment-status`, {
      payment_status: paymentStatus
    }, {
      headers: getAuthHeaders(token)
    });
    // Handle nested response structure
    return response.data.data;
  } catch (error) {
    console.error(`Error updating payment status for winner ${winnerId}:`, error);
    throw error;
  }
};

// Invoke a runner-up for a prize
const invokeRunnerUp = async (winnerId: string, token: string): Promise<RunnerUpInvocationResult> => {
  try {
    const response = await apiClient.post('/admin/draws/invoke-runner-up', {
      winner_id: winnerId
    }, {
      headers: getAuthHeaders(token)
    });
    // Handle nested response structure
    return response.data.data;
  } catch (error) {
    console.error(`Error invoking runner-up for winner ${winnerId}:`, error);
    throw error;
  }
};

export const drawService = {
  listDraws,
  getDrawById,
  listWinners,
  executeDraw,
  getEligibilityStats,
  getDrawEligibilityStats, // Added alias for backward compatibility
  updateWinnerPaymentStatus,
  invokeRunnerUp
};
