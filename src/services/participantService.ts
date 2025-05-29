// src/services/participantService.ts
import { enhancedApiClient } from './apiClient';
import { 
  ParticipantResponse, 
  ParticipantStatsResponse,
  DataUploadAuditResponse,
  PaginatedResponse
} from '../types/api';
import { UUID } from '../types/common';

/**
 * Service for managing participants
 */
export const participantService = {
  /**
   * Get participants with pagination
   * 
   * @param page - Page number
   * @param pageSize - Items per page
   * @param search - Optional search term
   * @returns Paginated list of participants
   */
  getParticipants: async (
    page = 1, 
    pageSize = 10,
    search?: string
  ): Promise<PaginatedResponse<ParticipantResponse>> => {
    return enhancedApiClient.getPaginated<ParticipantResponse>('/admin/participants', { 
      page, 
      pageSize,
      search
    });
  },

  /**
   * Get participant statistics
   * 
   * @returns Participant statistics
   */
  getParticipantStats: async (): Promise<ParticipantStatsResponse> => {
    return enhancedApiClient.get<ParticipantStatsResponse>('/admin/participants/stats');
  },

  /**
   * Upload participants CSV file
   * 
   * @param file - CSV file to upload
   * @returns Upload audit information
   */
  uploadParticipants: async (file: File): Promise<DataUploadAuditResponse> => {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Use the raw axios instance for multipart/form-data
    const response = await enhancedApiClient.instance.post('/admin/participants/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.data;
  },

  /**
   * Get upload audit history with pagination
   * 
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Paginated list of upload audits
   */
  getUploadAudits: async (
    page = 1, 
    pageSize = 10
  ): Promise<PaginatedResponse<DataUploadAuditResponse>> => {
    return enhancedApiClient.getPaginated<DataUploadAuditResponse>('/admin/participants/uploads', { 
      page, 
      pageSize
    });
  },

  /**
   * Delete an upload by ID
   * 
   * @param uploadId - Upload ID to delete
   * @returns Success message
   */
  deleteUpload: async (uploadId: UUID): Promise<{ message: string }> => {
    return enhancedApiClient.delete<{ message: string }>(`/admin/participants/uploads/${uploadId}`);
  }
};

export default participantService;
