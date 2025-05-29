// src/hooks/useParticipantUpload.ts
import { useState, useCallback } from 'react';
import { participantService } from '../services/participantService';
import { DataUploadAuditResponse } from '../types/api';

/**
 * Custom hook for participant upload functionality
 */
export const useParticipantUpload = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadResult, setUploadResult] = useState<DataUploadAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

      // Upload file
      const result = await participantService.uploadParticipants(file);
      
      // Clear progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);
      
      return result;
    } catch (err: any) {
      console.error('Error uploading participants:', err);
      setError(err.message || 'Failed to upload participants');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [validateCsvFile]);

  /**
   * Delete upload
   */
  const deleteUpload = useCallback(async (uploadId: string): Promise<boolean> => {
    setError(null);

    try {
      await participantService.deleteUpload(uploadId);
      return true;
    } catch (err: any) {
      console.error('Error deleting upload:', err);
      setError(err.message || 'Failed to delete upload');
      return false;
    }
  }, []);

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
