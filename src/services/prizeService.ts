// src/services/prizeService.ts
import { enhancedApiClient } from './apiClient';
import { 
  PrizeStructureResponse, 
  PrizeStructureCreateRequest, 
  PrizeStructureUpdateRequest,
  PaginatedResponse
} from '../types/api';
import { UUID } from '../types/common';

/**
 * Service for prize structure management
 */
export const prizeService = {
  /**
   * Get all prize structures
   * 
   * @param day - Optional filter by day of week
   * @returns List of prize structures
   */
  getAllPrizeStructures: async (day?: string): Promise<PrizeStructureResponse[]> => {
    return enhancedApiClient.get<PrizeStructureResponse[]>('/admin/prize-structures', { day });
  },

  /**
   * Get prize structure by ID
   * 
   * @param id - Prize structure ID
   * @returns Prize structure details
   */
  getPrizeStructureById: async (id: UUID): Promise<PrizeStructureResponse> => {
    return enhancedApiClient.get<PrizeStructureResponse>(`/admin/prize-structures/${id}`);
  },

  /**
   * Create a new prize structure
   * 
   * @param data - Prize structure data
   * @returns Created prize structure
   */
  createPrizeStructure: async (data: PrizeStructureCreateRequest): Promise<PrizeStructureResponse> => {
    return enhancedApiClient.post<PrizeStructureResponse>('/admin/prize-structures', data);
  },

  /**
   * Update an existing prize structure
   * 
   * @param id - Prize structure ID
   * @param data - Updated prize structure data
   * @returns Updated prize structure
   */
  updatePrizeStructure: async (id: UUID, data: PrizeStructureUpdateRequest): Promise<PrizeStructureResponse> => {
    return enhancedApiClient.put<PrizeStructureResponse>(`/admin/prize-structures/${id}`, data);
  },

  /**
   * Delete a prize structure
   * 
   * @param id - Prize structure ID
   * @returns Success message
   */
  deletePrizeStructure: async (id: UUID): Promise<{ message: string }> => {
    return enhancedApiClient.delete<{ message: string }>(`/admin/prize-structures/${id}`);
  },

  /**
   * Get active prize structures
   * 
   * @returns List of active prize structures
   */
  getActivePrizeStructures: async (): Promise<PrizeStructureResponse[]> => {
    return enhancedApiClient.get<PrizeStructureResponse[]>('/admin/prize-structures/active');
  },

  /**
   * Get prize structures with pagination
   * 
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Paginated list of prize structures
   */
  getPrizeStructuresWithPagination: async (
    page = 1, 
    pageSize = 10
  ): Promise<PaginatedResponse<PrizeStructureResponse>> => {
    return enhancedApiClient.getPaginated<PrizeStructureResponse>('/admin/prize-structures', { 
      page, 
      pageSize 
    });
  },

  /**
   * Check if a prize structure is valid for a specific date
   * 
   * @param prizeStructureId - Prize structure ID to validate
   * @param date - Date to check validity for
   * @returns Boolean indicating if the prize structure is valid for the date
   */
  isPrizeStructureValidForDate: async (prizeStructureId: UUID, date: string): Promise<boolean> => {
    try {
      const response = await enhancedApiClient.get<{ valid: boolean }>(`/admin/prize-structures/${prizeStructureId}/validate`, { date });
      return response.valid;
    } catch (err: unknown) {
      console.error('Error validating prize structure:', err);
      return false;
    }
  }
};

export default prizeService;
