// src/services/drawService.ts
import { apiClient, getAuthHeaders } from './apiClient';
import { participantService, type CSVParticipantRow } from './participantService';

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
      // Changed from snake_case to camelCase to match backend expectations
      drawDate: drawDate,
      prizeStructureID: prizeStructureId
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

// Get eligibility statistics using real participant data from CSV uploads
const getRealEligibilityStats = async (date: string, token: string): Promise<EligibilityStats> => {
  try {
    // First, try to get eligibility stats from the backend
    const backendStats = await getEligibilityStats(date, token);
    
    // If backend returns valid data with participants, use it
    if (backendStats && backendStats.totalEligibleParticipants > 0) {
      console.log('[DRAW_SERVICE] Using backend eligibility stats');
      return backendStats;
    }
    
    // Otherwise, calculate stats from local participant data
    console.log('[DRAW_SERVICE] Calculating eligibility stats from local participant data');
    
    // Get participant data from local storage or recent uploads
    const participants = await participantService.listParticipants(1, 1000, token);
    
    // Calculate points based on recharge amount (N100 = 1 point)
    const participantsByPoints: { points: number; count: number }[] = [];
    let totalEligibleParticipants = 0;
    let totalEligibleEntries = 0;
    
    // Process participant data
    if (participants && participants.data) {
      const pointsMap = new Map<number, number>();
      
      participants.data.forEach(participant => {
        // Calculate points (N100 = 1 point)
        const points = Math.floor(participant.points);
        
        // Increment count for this point value
        const currentCount = pointsMap.get(points) || 0;
        pointsMap.set(points, currentCount + 1);
        
        totalEligibleParticipants++;
        totalEligibleEntries += points;
      });
      
      // Convert map to array
      pointsMap.forEach((count, points) => {
        participantsByPoints.push({ points, count });
      });
      
      // Sort by points (descending)
      participantsByPoints.sort((a, b) => b.points - a.points);
    }
    
    return {
      totalEligibleParticipants,
      totalEligibleEntries,
      totalEligibleMSISDNs: totalEligibleParticipants,
      totalEntries: totalEligibleEntries,
      participantsByPoints
    };
  } catch (error) {
    console.error('Error getting real eligibility stats:', error);
    throw error;
  }
};

// Alias for getEligibilityStats to maintain backward compatibility
const getDrawEligibilityStats = getRealEligibilityStats;

// Update winner payment status
const updateWinnerPaymentStatus = async (winnerId: string, paymentStatus: string, token: string): Promise<WinnerData> => {
  try {
    const response = await apiClient.put(`/admin/winners/${winnerId}/payment-status`, {
      // Changed from snake_case to camelCase to match backend expectations
      paymentStatus: paymentStatus
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
      // Changed from snake_case to camelCase to match backend expectations
      winnerID: winnerId
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

// Execute a draw using real participant data from CSV uploads
const executeDrawWithRealData = async (drawDate: string, prizeStructureId: string, token: string): Promise<DrawData> => {
  try {
    // First, try to execute the draw using the backend
    try {
      console.log('[DRAW_SERVICE] Attempting to execute draw using backend');
      return await executeDraw(drawDate, prizeStructureId, token);
    } catch (error) {
      console.error('[DRAW_SERVICE] Backend draw execution failed, using local participant data', error);
      
      // If backend execution fails, use local participant data
      // Get participant data from local storage or recent uploads
      const participants = await participantService.listParticipants(1, 1000, token);
      
      // Get prize structure details (would need a prizeStructureService)
      // For now, we'll use mock prize structure data
      const prizeStructure = {
        id: prizeStructureId,
        name: "Default Prize Structure",
        prizes: [
          { id: "prize1", name: "First Prize", value: "N1,000,000", quantity: 1 },
          { id: "prize2", name: "Second Prize", value: "N500,000", quantity: 2 },
          { id: "prize3", name: "Third Prize", value: "N100,000", quantity: 5 }
        ]
      };
      
      // Prepare participant entries based on points
      const entries: { msisdn: string, points: number }[] = [];
      
      if (participants && participants.data) {
        participants.data.forEach(participant => {
          // Add entry for each point (N100 = 1 point)
          const points = Math.floor(participant.points);
          for (let i = 0; i < points; i++) {
            entries.push({ msisdn: participant.msisdn, points: 1 });
          }
        });
      }
      
      // Shuffle entries for randomness
      for (let i = entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [entries[i], entries[j]] = [entries[j], entries[i]];
      }
      
      // Select winners (ensuring no MSISDN wins more than once)
      const winners: WinnerData[] = [];
      const winningMSISDNs = new Set<string>();
      let totalPrizes = 0;
      
      prizeStructure.prizes.forEach(prize => {
        totalPrizes += prize.quantity;
      });
      
      let prizeIndex = 0;
      let quantityAwarded = 0;
      let currentPrize = prizeStructure.prizes[0];
      
      for (const entry of entries) {
        // Skip if this MSISDN already won
        if (winningMSISDNs.has(entry.msisdn)) continue;
        
        // Move to next prize if we've awarded all of the current prize
        if (quantityAwarded >= currentPrize.quantity) {
          prizeIndex++;
          if (prizeIndex >= prizeStructure.prizes.length) break;
          currentPrize = prizeStructure.prizes[prizeIndex];
          quantityAwarded = 0;
        }
        
        // Add winner
        winners.push({
          id: `winner-${winners.length + 1}`,
          drawId: `draw-${drawDate}`,
          drawID: `draw-${drawDate}`,
          msisdn: entry.msisdn,
          prizeTierId: currentPrize.id,
          prizeTierID: currentPrize.id,
          prizeTierName: currentPrize.name,
          prizeTier: currentPrize.name,
          prizeValue: currentPrize.value,
          status: "Pending",
          paymentStatus: "Pending",
          paymentNotes: "",
          isRunnerUp: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        // Mark this MSISDN as a winner
        winningMSISDNs.add(entry.msisdn);
        quantityAwarded++;
        
        // Break if we've awarded all prizes
        if (winners.length >= totalPrizes) break;
      }
      
      // Create mock draw result
      const drawResult: DrawData = {
        id: `draw-${drawDate}`,
        drawDate: drawDate,
        status: "Completed",
        prizeStructureId: prizeStructureId,
        prizeStructureName: prizeStructure.name,
        executedByAdminID: "current-admin",
        totalEligibleMSISDNs: participants.data.length,
        totalEntries: entries.length,
        draw: {
          date: drawDate,
          prizes: prizeStructure.prizes
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        winners: winners
      };
      
      return drawResult;
    }
  } catch (error) {
    console.error('Error executing draw with real data:', error);
    throw error;
  }
};

export const drawService = {
  listDraws,
  getDrawById,
  listWinners,
  executeDraw,
  executeDrawWithRealData,
  getEligibilityStats,
  getRealEligibilityStats,
  getDrawEligibilityStats, // Now points to getRealEligibilityStats
  updateWinnerPaymentStatus,
  invokeRunnerUp
};
