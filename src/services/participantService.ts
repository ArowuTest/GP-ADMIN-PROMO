// src/services/participantService.ts
import { apiClient, getAuthHeaders } from './apiClient';
import Papa from 'papaparse';

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

export interface UploadResponse {
  message: string;
  uploadId: string;
  auditId: string;
  status: string;
  totalDataRowsProcessed: number;
  successfulRowsImported: number;
  duplicatesSkippedCount: number;
  errors: string[];
  skippedDuplicateEventDetails: any[];
}

export interface CSVParticipantRow {
  msisdn: string;
  rechargeAmount: string | number;
  rechargeDate: string;
  [key: string]: any; // Allow for additional fields
}

export interface CSVValidationResult {
  isValid: boolean;
  data: CSVParticipantRow[];
  errors: string[];
  duplicates: CSVParticipantRow[];
  validRows: CSVParticipantRow[];
  invalidRows: CSVParticipantRow[];
  totalRows: number;
  validRowCount: number;
  invalidRowCount: number;
  duplicateCount: number;
}

// Client-side CSV validation
const validateCSV = async (file: File): Promise<CSVValidationResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const duplicates: CSVParticipantRow[] = [];
        const validRows: CSVParticipantRow[] = [];
        const invalidRows: CSVParticipantRow[] = [];
        const msisdnSet = new Set<string>();
        
        // Check if required columns exist
        const headers = results.meta.fields || [];
        const requiredColumns = ['msisdn', 'rechargeAmount', 'rechargeDate'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
          resolve({
            isValid: false,
            data: [],
            errors,
            duplicates: [],
            validRows: [],
            invalidRows: [],
            totalRows: 0,
            validRowCount: 0,
            invalidRowCount: 0,
            duplicateCount: 0
          });
          return;
        }
        
        // Validate each row
        results.data.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // +2 because index is 0-based and we skip header row
          const participantRow = row as CSVParticipantRow;
          let isRowValid = true;
          const rowErrors: string[] = [];
          
          // Validate MSISDN
          if (!participantRow.msisdn) {
            rowErrors.push(`Row ${rowNumber}: MSISDN is required`);
            isRowValid = false;
          } else if (!/^\d+$/.test(participantRow.msisdn)) {
            rowErrors.push(`Row ${rowNumber}: MSISDN must contain only digits`);
            isRowValid = false;
          }
          
          // Validate recharge amount
          if (!participantRow.rechargeAmount) {
            rowErrors.push(`Row ${rowNumber}: Recharge amount is required`);
            isRowValid = false;
          } else {
            const amount = Number(participantRow.rechargeAmount);
            if (isNaN(amount) || amount <= 0) {
              rowErrors.push(`Row ${rowNumber}: Recharge amount must be a positive number`);
              isRowValid = false;
            }
          }
          
          // Validate recharge date
          if (!participantRow.rechargeDate) {
            rowErrors.push(`Row ${rowNumber}: Recharge date is required`);
            isRowValid = false;
          } else {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
            if (!dateRegex.test(participantRow.rechargeDate)) {
              rowErrors.push(`Row ${rowNumber}: Recharge date must be in YYYY-MM-DD format`);
              isRowValid = false;
            }
          }
          
          // Check for duplicates
          if (participantRow.msisdn && msisdnSet.has(participantRow.msisdn)) {
            duplicates.push(participantRow);
            rowErrors.push(`Row ${rowNumber}: Duplicate MSISDN ${participantRow.msisdn}`);
            isRowValid = false;
          } else if (participantRow.msisdn) {
            msisdnSet.add(participantRow.msisdn);
          }
          
          if (isRowValid) {
            validRows.push(participantRow);
          } else {
            invalidRows.push(participantRow);
            errors.push(...rowErrors);
          }
        });
        
        resolve({
          isValid: errors.length === 0,
          data: results.data as CSVParticipantRow[],
          errors,
          duplicates,
          validRows,
          invalidRows,
          totalRows: results.data.length,
          validRowCount: validRows.length,
          invalidRowCount: invalidRows.length,
          duplicateCount: duplicates.length
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
};

// Upload participants from CSV file with client-side validation
const uploadParticipantsWithValidation = async (file: File, token: string): Promise<UploadResponse> => {
  try {
    // First validate the CSV file client-side
    const validationResult = await validateCSV(file);
    
    // If validation fails with critical errors, throw error before sending to server
    if (!validationResult.isValid && validationResult.errors.some(err => err.includes('Missing required columns'))) {
      throw new Error(`CSV validation failed: ${validationResult.errors[0]}`);
    }
    
    // Proceed with upload even if there are some invalid rows - the backend will handle them
    const formData = new FormData();
    formData.append('file', file);
    formData.append('validationResult', JSON.stringify({
      totalRows: validationResult.totalRows,
      validRowCount: validationResult.validRowCount,
      invalidRowCount: validationResult.invalidRowCount,
      duplicateCount: validationResult.duplicateCount
    }));

    const response = await apiClient.post('/admin/participants/upload', formData, {
      headers: {
        ...getAuthHeaders(token),
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Handle nested response structure
    const serverResponse = response.data.data || response.data;
    
    // Merge client-side validation results with server response
    return {
      ...serverResponse,
      clientValidation: {
        totalRows: validationResult.totalRows,
        validRowCount: validationResult.validRowCount,
        invalidRowCount: validationResult.invalidRowCount,
        duplicateCount: validationResult.duplicateCount,
        errors: validationResult.errors
      }
    };
  } catch (error) {
    console.error('Error uploading participants:', error);
    throw error;
  }
};

// Upload participants from CSV file (original method for backward compatibility)
const uploadParticipants = async (file: File, token: string): Promise<UploadResponse> => {
  // Use the new validation method
  return uploadParticipantsWithValidation(file, token);
};

// List all participants
const listParticipants = async (page: number = 1, limit: number = 50, token: string): Promise<{ data: ParticipantData[]; total: number; page: number; limit: number }> => {
  try {
    const response = await apiClient.get('/admin/participants', {
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
    
    // Handle nested response structure
    return response.data.data || response.data;
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
    
    // Handle nested response structure
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
    
    // Handle nested response structure
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error deleting upload ${uploadId}:`, error);
    throw error;
  }
};

export const participantService = {
  validateCSV,
  uploadParticipants,
  uploadParticipantsWithValidation,
  listParticipants,
  getParticipantStats,
  listUploadAudits,
  deleteUpload
};
