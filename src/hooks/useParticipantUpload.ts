// src/hooks/useParticipantUpload.ts
import { useState, useCallback } from 'react';
import { participantService, UploadResponse } from '../services/participantService';
import { DataUploadAuditResponse } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for participant upload functionality
 */
export const useParticipantUpload = () => {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadResult, setUploadResult] = useState<DataUploadAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  /**
   * Map UploadResponse to DataUploadAuditResponse
   */
  const mapUploadResponseToAuditResponse = (response: UploadResponse): DataUploadAuditResponse => {
    return {
      id: response.auditId,
      fileName: 'participants.csv', // Default filename since it's not in the response
      uploadedBy: 'Current User', // Default user since it's not in the response
      uploadedAt: new Date().toISOString(), // Current time since it's not in the response
      status: response.status,
      totalUploaded: response.totalDataRowsProcessed,
      successfullyImported: response.successfulRowsImported,
      duplicatesSkipped: response.duplicatesSkippedCount,
      errorsEncountered: response.errors.length,
      details: response.message,
      operationType: 'UPLOAD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  /**
   * Validate CSV file before upload
   */
  const validateCsvFile = useCallback((file: File): boolean => {
    setValidationErrors([]);
    const errors: string[] = [];

    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      errors.push('File must be a CSV file');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }

    // Update validation errors
    if (errors.length > 0) {
      setValidationErrors(errors);
      return false;
    }

    return true;
  }, []);

  /**
   * Upload CSV file
   */
  const uploadCsvFile = useCallback(async (file: File): Promise<DataUploadAuditResponse | null> => {
    // Validate file first
    if (!validateCsvFile(file)) {
      return null;
    }

    if (!token) {
      setError('Authentication token not available');
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadResult(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);

      // Upload file - Fixed: Added token parameter
      const result = await participantService.uploadParticipants(file, token);
      
      // Clear progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Transform the response to match expected type
      const transformedResult = mapUploadResponseToAuditResponse(result);
      setUploadResult(transformedResult);
      
      return transformedResult;
    } catch (err: any) {
      console.error('Error uploading participants:', err);
      setError(err.message || 'Failed to upload participants');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [validateCsvFile, token]);

  /**
   * Delete upload
   */
  const deleteUpload = useCallback(async (uploadId: string): Promise<boolean> => {
    setError(null);

    if (!token) {
      setError('Authentication token not available');
      return false;
    }

    try {
      // Fixed: Added token parameter
      await participantService.deleteUpload(uploadId, token);
      return true;
    } catch (err: any) {
      console.error('Error deleting upload:', err);
      setError(err.message || 'Failed to delete upload');
      return false;
    }
  }, [token]);

  /**
   * Reset upload state
   */
  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadResult(null);
    setError(null);
    setValidationErrors([]);
  }, []);

  return {
    isUploading,
    uploadProgress,
    uploadResult,
    error,
    validationErrors,
    validateCsvFile,
    uploadCsvFile,
    deleteUpload,
    resetUploadState
  };
};

export default useParticipantUpload;
