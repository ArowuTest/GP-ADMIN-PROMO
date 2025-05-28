// src/services/drawService.ts - Updated with proper interfaces and type safety
import { apiClient, getAuthHeaders } from './apiClient';

// Define types for draw-related data
export interface DrawData {
  id: string;
  drawDate: string;
  status: string;
  prizeStructureId?: string;
  prizeStructureName?: string;
  executedByAdminID?: string;
  totalEligibleMSISDNs?: number;
  totalEntries?: number;
  draw?: any; // Support for draw property access
  message?: string; // For error messages
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  winners?: WinnerData[];
  runnerUps?: WinnerData[];
}

export interface WinnerData {
  id: string;
  drawId: string;
  drawID?: string; // Alias for backward compatibility
  msisdn: string;
  prizeId: string;
  prizeTierId?: string;
  prizeTierID?: string; // Alias for backward compatibility
  prizeTierName?: string;
  prizeTier?: string; // Alias for backward compatibility
  prizeValue?: number | string;
  status: string;
  paymentStatus?: string;
  paymentNotes?: string;
  isRunnerUp: boolean;
  originalWinnerId?: string;
  runnerUpRank?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityStats {
  totalEligibleParticipants: number;
  totalEligibleEntries: number;
  totalEligibleMSISDNs: number; // Added to match component usage
  totalEntries: number; // Added to match component usage
  participantsByPoints: {
    points: number;
    count: number;
  }[];
}

export interface DrawExecutionRequest {
  drawDate: string;
  prizeStructureId: string;
}

// Updated to ensure compatibility with DrawData
export interface DrawExecutionResponse {
  drawId: string;
  id: string; // Changed from optional to required to match DrawData
  draw?: DrawData;
  drawDate: string;
  status: string;
  winners: WinnerData[];
  runnerUps: WinnerData[];
  message: string;
  createdAt: string; // Changed from optional to required to match DrawData
  updatedAt: string; // Changed from optional to required to match DrawData
  createdBy: string; // Changed from optional to required to match DrawData
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
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
    console.error('Error listing winners:', error);
    throw error;
  }
};

// Execute a new draw
const executeDraw = async (drawDate: string, prizeStructureId: string, token: string): Promise<DrawExecutionResponse> => {
  try {
    const response = await apiClient.post('/admin/draws/execute', {
      drawDate: drawDate,
      prizeStructureId: prizeStructureId // Aligned with backend expectations
    }, {
      headers: getAuthHeaders(token)
    });
    
    // Handle nested response structure
    const responseData = response.data.data || response.data;
    
    // Ensure all required properties exist for DrawData compatibility
    if (!responseData.id) {
      responseData.id = responseData.drawId || `draw-${new Date().getTime()}`;
    }
    
    if (!responseData.createdAt) {
      responseData.createdAt = new Date().toISOString();
    }
    
    if (!responseData.updatedAt) {
      responseData.updatedAt = new Date().toISOString();
    }
    
    if (!responseData.createdBy) {
      responseData.createdBy = "system";
    }
    
    return responseData;
  } catch (error: any) {
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
    const data = response.data.data || response.data;
    
    // Ensure all required properties exist
    return {
      totalEligibleParticipants: data.totalEligibleParticipants || 0,
      totalEligibleEntries: data.totalEligibleEntries || 0,
      totalEligibleMSISDNs: data.totalEligibleMSISDNs || data.totalEligibleParticipants || 0, // Map to existing property if missing
      totalEntries: data.totalEntries || data.totalEligibleEntries || 0, // Map to existing property if missing
      participantsByPoints: data.participantsByPoints || []
    };
  } catch (error: any) {
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
      paymentStatus: paymentStatus
    }, {
      headers: getAuthHeaders(token)
    });
    // Handle nested response structure
    return response.data.data;
  } catch (error: any) {
    console.error(`Error updating payment status for winner ${winnerId}:`, error);
    throw error;
  }
};

// Invoke a runner-up for a prize
const invokeRunnerUp = async (winnerId: string, token: string): Promise<RunnerUpInvocationResult> => {
  try {
    const response = await apiClient.post(`/admin/draws/winners/${winnerId}/invoke-runner-up`, {}, {
      headers: getAuthHeaders(token)
    });
    
    // Handle nested response structure
    return response.data.data || response.data;
  } catch (error: any) {
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
