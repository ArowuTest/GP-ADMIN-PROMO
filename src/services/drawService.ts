// src/services/drawService.ts
import { apiClient, getAuthHeaders } from './apiClient';
import { participantService } from './participantService';

// Define types for draw-related data
export interface DrawData {
  id: string;
  drawDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  winners?: WinnerData[];
  runnerUps?: WinnerData[];
}

export interface WinnerData {
  id: string;
  drawId: string;
  msisdn: string;
  prizeId: string;
  prizeName?: string;
  prizeValue?: number;
  status: string;
  isRunnerUp: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityStats {
  totalEligibleParticipants: number;
  totalEligibleEntries: number;
  participantsByPoints: {
    points: number;
    count: number;
  }[];
}

export interface DrawExecutionRequest {
  drawDate: string;
  prizeStructureId: string;
}

export interface DrawExecutionResponse {
  drawId: string;
  drawDate: string;
  status: string;
  winners: WinnerData[];
  runnerUps: WinnerData[];
  message: string;
}

// Get eligibility statistics for a specific draw date
const getEligibilityStats = async (drawDate: string, token: string): Promise<EligibilityStats> => {
  try {
    const response = await apiClient.get(`/admin/draws/eligibility-stats`, {
      params: { drawDate },
      headers: getAuthHeaders(token)
    });
    
    // Handle nested response structure
    return response.data.data || response.data;
  } catch (error: any) {
    console.error('Error getting eligibility stats:', error);
    
    // Fallback to calculating stats from local participant data if backend fails
    try {
      console.log('Attempting to calculate eligibility stats from local data...');
      return await calculateEligibilityStatsFromLocalData(drawDate, token);
    } catch (fallbackError: any) {
      console.error('Fallback eligibility calculation failed:', fallbackError);
      throw error; // Throw the original error if fallback fails
    }
  }
};

// Calculate eligibility statistics from local participant data (fallback method)
const calculateEligibilityStatsFromLocalData = async (drawDate: string, token: string): Promise<EligibilityStats> => {
  // Get all participants from local data
  const participantsResponse = await participantService.listParticipants(1, 1000, token);
  const participants = participantsResponse.data;
  
  // Filter eligible participants based on date
  // This is a simplified implementation - actual eligibility rules may be more complex
  const drawDateObj = new Date(drawDate);
  const eligibleParticipants = participants.filter(p => {
    const participantDate = new Date(p.createdAt);
    return participantDate <= drawDateObj;
  });
  
  // Calculate points distribution
  const pointsMap = new Map<number, number>();
  let totalEntries = 0;
  
  eligibleParticipants.forEach(p => {
    const points = p.points || 0;
    totalEntries += points;
    
    const currentCount = pointsMap.get(points) || 0;
    pointsMap.set(points, currentCount + 1);
  });
  
  // Convert points map to array format
  const participantsByPoints = Array.from(pointsMap.entries()).map(([points, count]) => ({
    points,
    count
  })).sort((a, b) => b.points - a.points);
  
  return {
    totalEligibleParticipants: eligibleParticipants.length,
    totalEligibleEntries: totalEntries,
    participantsByPoints
  };
};

// Execute a draw for a specific date and prize structure
const executeDraw = async (drawDate: string, prizeStructureId: string, token: string): Promise<DrawExecutionResponse> => {
  try {
    const response = await apiClient.post('/admin/draws/execute', {
      drawDate,
      prizeStructureId
    }, {
      headers: getAuthHeaders(token)
    });
    
    // Handle nested response structure
    return response.data.data || response.data;
  } catch (error: any) {
    console.error('Error executing draw:', error);
    throw error;
  }
};

// List all draws
const listDraws = async (page: number = 1, limit: number = 50, token: string): Promise<{ data: DrawData[]; total: number; page: number; limit: number }> => {
  try {
    const response = await apiClient.get('/admin/draws', {
      params: { page, limit },
      headers: getAuthHeaders(token)
    });
    
    // Handle nested response structure
    const responseData = response.data.data || response.data;
    return {
      data: responseData.data || [],
      total: responseData.total || 0,
      page: responseData.page || 1,
      limit: responseData.limit || 50
    };
  } catch (error: any) {
    console.error('Error listing draws:', error);
    throw error;
  }
};

// Get a specific draw by ID
const getDrawById = async (drawId: string, token: string): Promise<DrawData> => {
  try {
    const response = await apiClient.get(`/admin/draws/${drawId}`, {
      headers: getAuthHeaders(token)
    });
    
    // Handle nested response structure
    return response.data.data || response.data;
  } catch (error: any) {
    console.error(`Error getting draw ${drawId}:`, error);
    throw error;
  }
};

// Invoke a runner-up for a specific winner
const invokeRunnerUp = async (winnerId: string, token: string): Promise<{ message: string; winner: WinnerData; previousWinner: WinnerData }> => {
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
  getEligibilityStats,
  calculateEligibilityStatsFromLocalData,
  executeDraw,
  listDraws,
  getDrawById,
  invokeRunnerUp
};
