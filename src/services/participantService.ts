// src/services/participantService.ts
import axios from 'axios';
import { apiClient, getAuthHeaders } from './apiClient';
import Papa from 'papaparse';

// Define types for participant data
export interface Participant {
  id: string;
  msisdn: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

// Define types for CSV data
export interface CSVParticipantRow {
  msisdn: string;
  rechargeAmount: string;
  rechargeDate: string;
  [key: string]: string; // Allow for additional fields
}

// Define validation result type
export interface CSVValidationResult {
  isValid: boolean;
  data: CSVParticipantRow[];
  totalRows: number;
  validRowCount: number;
  invalidRowCount: number;
  duplicateCount: number;
  duplicates: CSVParticipantRow[];
  invalidRows: CSVParticipantRow[];
  errors: string[];
}

// Define upload response type
export interface UploadResponse {
  auditId: string;
  status: string;
  message: string;
  totalDataRowsProcessed: number;
  successfulRowsImported: number;
  duplicatesSkippedCount?: number;
  errors?: string[];
  skippedDuplicateEventDetails?: string[];
}

// List participants with pagination
const listParticipants = async (page: number = 1, limit: number = 50, token: string): Promise<{ data: Participant[]; total: number; page: number; limit: number }> => {
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
  } catch (error: any) {
    console.error('Error listing participants:', error);
    throw error;
  }
};

// Validate CSV file before upload
const validateCSV = async (file: File): Promise<CSVValidationResult> => {
  return new Promise((resolve, reject) => {
    // Initialize validation result
    const result: CSVValidationResult = {
      isValid: false,
      data: [],
      totalRows: 0,
      validRowCount: 0,
      invalidRowCount: 0,
      duplicateCount: 0,
      duplicates: [],
      invalidRows: [],
      errors: []
    };
    
    // Parse CSV file
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<CSVParticipantRow>) => {
        // Check if required columns exist
        const requiredColumns = ['msisdn', 'rechargeAmount', 'rechargeDate'];
        const headers = results.meta.fields || [];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          result.errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
          resolve(result);
          return;
        }
        
        // Process data rows
        result.totalRows = results.data.length;
        
        // Track MSISDNs to detect duplicates
        const msisdnSet = new Set<string>();
        
        // Validate each row
        results.data.forEach((row: CSVParticipantRow, index: number) => {
          let isValid = true;
          
          // Validate MSISDN
          if (!row.msisdn || !/^\d{10,15}$/.test(row.msisdn)) {
            isValid = false;
            result.errors.push(`Row ${index + 2}: Invalid MSISDN format: ${row.msisdn}`);
          }
          
          // Validate recharge amount
          if (!row.rechargeAmount || isNaN(Number(row.rechargeAmount)) || Number(row.rechargeAmount) <= 0) {
            isValid = false;
            result.errors.push(`Row ${index + 2}: Invalid recharge amount: ${row.rechargeAmount}`);
          }
          
          // Validate recharge date
          if (!row.rechargeDate || isNaN(Date.parse(row.rechargeDate))) {
            isValid = false;
            result.errors.push(`Row ${index + 2}: Invalid recharge date: ${row.rechargeDate}`);
          }
          
          // Check for duplicates
          if (row.msisdn && msisdnSet.has(row.msisdn)) {
            result.duplicateCount++;
            result.duplicates.push(row);
            // Note: We don't mark duplicates as invalid, just track them separately
          } else if (row.msisdn) {
            msisdnSet.add(row.msisdn);
          }
          
          // Track valid/invalid rows
          if (isValid) {
            result.validRowCount++;
          } else {
            result.invalidRowCount++;
            result.invalidRows.push(row);
          }
        });
        
        // Determine overall validity
        result.isValid = result.errors.length === 0 || 
                        (result.errors.length > 0 && !result.errors.some(err => err.includes('Missing required columns')));
        
        resolve(result);
      },
      error: (error: Error) => {
        result.errors.push(`CSV parsing error: ${error.message}`);
        reject(result);
      }
    });
  });
};

// Upload participants with validation
const uploadParticipantsWithValidation = async (file: File, token: string): Promise<UploadResponse> => {
  try {
    // First validate the file
    const validationResult = await validateCSV(file);
    
    // Prepare form data for upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload the file
    const response = await axios.post(
      `${apiClient.defaults.baseURL}/admin/participants/upload`,
      formData,
      {
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    // Process response
    const uploadResponse: UploadResponse = response.data.data || response.data;
    
    // Add client validation results to the response
    return {
      ...uploadResponse,
      clientValidation: {
        totalRows: validationResult.totalRows,
        validRowCount: validationResult.validRowCount,
        invalidRowCount: validationResult.invalidRowCount,
        duplicateCount: validationResult.duplicateCount,
        errors: validationResult.errors
      }
    };
  } catch (error: any) {
    console.error('Error uploading participants:', error);
    
    // Handle API error response
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Upload failed');
    }
    
    throw error;
  }
};

// Upload participants (original method without validation)
const uploadParticipants = async (file: File, token: string): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      `${apiClient.defaults.baseURL}/admin/participants/upload`,
      formData,
      {
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.data || response.data;
  } catch (error: any) {
    console.error('Error uploading participants:', error);
    
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Upload failed');
    }
    
    throw error;
  }
};

export const participantService = {
  listParticipants,
  validateCSV,
  uploadParticipants,
  uploadParticipantsWithValidation
};
