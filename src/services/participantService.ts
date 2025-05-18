import axios from "axios";
import { apiClient, getAuthHeaders } from './apiClient';

// Define types for participant-related data
export interface ParticipantData {
  id: string;
  msisdn: string;
  points: number;
  uploadId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantStats {
  totalParticipants: number;
  totalPoints: number;
  participantsByPoints: {
    points: number;
    count: number;
  }[];
}

export interface ParticipantUploadAudit {
  id: string;
  userId: string;
  userName: string;
  fileName: string;
  recordCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Upload participants from CSV file
const uploadParticipants = async (file: File, token: string): Promise<{ message: string; uploadId: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/admin/participants/upload', formData, {
      headers: {
        ...getAuthHeaders(token),
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error uploading participants:', error);
    throw error;
  }
};

// List all participants
const listParticipants = async (page: number = 1, limit: number = 50, token: string): Promise<{ data: ParticipantData[]; total: number; page: number; limit: number }> => {
  try {
    const response = await apiClient.get('/admin/participants', {
      params: { page, limit },
      headers: getAuthHeaders(token)
    });
    
    return response.data;
  } catch (error) {
    console.error('Error listing participants:', error);
    throw error;
  }
};

// Get participant statistics
const getParticipantStats = async (token: string): Promise<ParticipantStats> => {
  try {
    const response = await apiClient.get('/admin/participants/stats', {
      headers: getAuthHeaders(token)
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error getting participant stats:', error);
    throw error;
  }
};

// List participant upload audits
const listUploadAudits = async (token: string): Promise<ParticipantUploadAudit[]> => {
  try {
    const response = await apiClient.get('/admin/participants/uploads', {
      headers: getAuthHeaders(token)
    });
    
    return response.data.data || [];
  } catch (error) {
    console.error('Error listing upload audits:', error);
    throw error;
  }
};

// Delete a participant upload
const deleteUpload = async (uploadId: string, token: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete(`/admin/participants/uploads/${uploadId}`, {
      headers: getAuthHeaders(token)
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error deleting upload ${uploadId}:`, error);
    throw error;
  }
};

export const participantService = {
  uploadParticipants,
  listParticipants,
  getParticipantStats,
  listUploadAudits,
  deleteUpload
};
