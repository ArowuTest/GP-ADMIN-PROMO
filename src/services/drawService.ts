// src/services/drawService.ts
import { enhancedApiClient } from './apiClient';
import { 
  DrawResponse, 
  DrawCreateRequest, 
  DrawUpdateRequest,
  DrawExecutionRequest,
  DrawExecutionResponse,
  EligibilityStatsResponse,
  WinnerResponse,
  PaginatedResponse,
  RunnerUpInvokeRequest
} from '../types/api';
import { UUID, DrawStatus, PaymentStatus } from '../types/common';

/**
 * Service for draw-related API operations
 */
export const drawService = {
  /**
   * Get all draws
   */
  async getAllDraws(): Promise<DrawResponse[]> {
    return enhancedApiClient.get<DrawResponse[]>('/admin/draws');
  },

  /**
   * Get draw by ID
   */
  async getDrawById(id: UUID): Promise<DrawResponse> {
    return enhancedApiClient.get<DrawResponse>(`/admin/draws/${id}`);
  },

  /**
   * Get draws by date
   */
  async getDrawsByDate(date: string): Promise<DrawResponse[]> {
    return enhancedApiClient.get<DrawResponse[]>(`/admin/draws/date/${date}`);
  },

  /**
   * Create a new draw
   */
  async createDraw(data: DrawCreateRequest): Promise<DrawResponse> {
    return enhancedApiClient.post<DrawResponse>('/admin/draws', data);
  },

  /**
   * Update an existing draw
   */
  async updateDraw(id: UUID, data: DrawUpdateRequest): Promise<DrawResponse> {
    return enhancedApiClient.put<DrawResponse>(`/admin/draws/${id}`, data);
  },

  /**
   * Delete a draw
   */
  async deleteDraw(id: UUID): Promise<boolean> {
    try {
      await enhancedApiClient.delete<{ message: string }>(`/admin/draws/${id}`);
      return true;
    } catch (err: unknown) {
      console.error('Error deleting draw:', err);
      
      if (err instanceof Error) {
        throw new Error(`Failed to delete draw: ${err.message}`);
      } else {
        throw new Error('Failed to delete draw due to an unknown error');
      }
    }
  },

  /**
   * Get eligibility statistics for a specific date
   */
  async getEligibilityStats(date: string): Promise<EligibilityStatsResponse> {
    return enhancedApiClient.get<EligibilityStatsResponse>(`/admin/draws/eligibility-stats`, { drawDate: date });
  },

  /**
   * Validate if a prize structure is valid for a specific date
   * 
   * @param prizeStructureId - Prize structure ID to validate
   * @param date - Date to check validity for
   * @returns Boolean indicating if the prize structure is valid for the date
   */
  async validatePrizeStructureForDate(prizeStructureId: UUID, date: string): Promise<boolean> {
    try {
      const response = await enhancedApiClient.get<{ valid: boolean }>(`/admin/prize-structures/${prizeStructureId}/validate`, { date });
      return response.valid;
    } catch (err: unknown) {
      console.error('Error validating prize structure:', err);
      return false;
    }
  },

  /**
   * Execute a draw
   * 
   * @param drawDate - Date for the draw
   * @param prizeStructureId - Prize structure ID
   * @param onProgress - Optional callback for progress updates
   * @returns Draw execution response
   */
  async executeDraw(
    drawDate: string, 
    prizeStructureId: UUID,
    onProgress?: (progress: number) => void
  ): Promise<DrawExecutionResponse> {
    // If onProgress is provided, simulate progress for frontend animation
    if (onProgress) {
      // This is just for UI feedback, the actual draw happens on the backend
      const interval = setInterval(() => {
        const progress = Math.min(95, Math.random() * 100); // Never reach 100% until actual response
        onProgress(progress);
      }, 500);
      
      try {
        const request: DrawExecutionRequest = {
          drawDate: drawDate, // Updated to match backend contract
          prizeStructureId
        };
        
        const response = await enhancedApiClient.post<DrawExecutionResponse>('/admin/draws/execute', request);
        
        clearInterval(interval);
        onProgress(100); // Complete the progress
        return response;
      } catch (error: unknown) {
        clearInterval(interval);
        throw error;
      }
    } else {
      // Standard execution without progress tracking
      const request: DrawExecutionRequest = {
        drawDate: drawDate, // Updated to match backend contract
        prizeStructureId
      };
      
      return enhancedApiClient.post<DrawExecutionResponse>('/admin/draws/execute', request);
    }
  },

  /**
   * Get winners and runner-ups for a specific draw
   */
  async getDrawWinners(drawId: UUID): Promise<WinnerResponse[]> {
    return enhancedApiClient.get<WinnerResponse[]>(`/admin/draws/${drawId}/winners`);
  },

  /**
   * Invoke a runner-up for a winner
   */
  async invokeRunnerUp(winnerId: UUID): Promise<WinnerResponse> {
    const request: RunnerUpInvokeRequest = {
      winnerId
    };
    return enhancedApiClient.post<WinnerResponse>(`/admin/draws/invoke-runner-up`, request);
  },

  /**
   * Update winner payment status
   */
  async updateWinnerPaymentStatus(
    winnerId: UUID, 
    status: PaymentStatus, 
    ref?: string, 
    notes?: string
  ): Promise<WinnerResponse> {
    return enhancedApiClient.put<WinnerResponse>(`/admin/winners/${winnerId}/payment-status`, {
      paymentStatus: status,
      paymentRef: ref,
      paymentNotes: notes
    });
  },

  /**
   * Get recent winners and runner-ups
   */
  async getRecentWinners(): Promise<WinnerResponse[]> {
    return enhancedApiClient.get<WinnerResponse[]>('/admin/winners/recent');
  },

  /**
   * Check the status of a draw
   * 
   * @param drawId - Draw ID
   * @returns Draw status
   */
  async checkDrawStatus(drawId: UUID): Promise<DrawStatus> {
    const draw = await enhancedApiClient.get<DrawResponse>(`/admin/draws/${drawId}`);
    return draw.status;
  },

  /**
   * Get draw history with pagination
   * 
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Paginated list of draws
   */
  async getDrawHistory(page = 1, pageSize = 10): Promise<PaginatedResponse<DrawResponse>> {
    return enhancedApiClient.getPaginated<DrawResponse>('/admin/draws', { page, pageSize });
  },

  /**
   * Cancel a draw
   * 
   * @param drawId - Draw ID
   * @returns Success message
   */
  async cancelDraw(drawId: UUID): Promise<{ message: string }> {
    return enhancedApiClient.post<{ message: string }>(`/admin/draws/${drawId}/cancel`, {});
  }
};

export default drawService;
