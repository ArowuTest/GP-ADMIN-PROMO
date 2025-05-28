// src/components/ParticipantManagement/ParticipantUploadComponent.tsx - Fixed boolean/null type issue
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { participantService } from "../../services/participantService";
import Papa from 'papaparse';

// Component implementation with fixed type issues
const ParticipantUploadComponent: React.FC = () => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | undefined>(undefined); // Changed from boolean | null
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [uploadStats, setUploadStats] = useState<{
    totalRows: number;
    successfulRows: number;
    duplicatesSkipped: number;
    errors: string[];
  } | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Component implementation...
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      // Reset states
      setUploadSuccess(undefined); // Use undefined instead of null
      setUploadMessage("");
      setUploadStats(null);
      setValidationErrors([]);
      
      // Preview file
      previewCSV(file);
    }
  };
  
  // Preview CSV file
  const previewCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      preview: 5, // Show first 5 rows
      skipEmptyLines: true,
      complete: (results) => {
        setPreviewData(results.data);
        validateCSV(file);
      },
      error: (error) => {
        setValidationErrors([`Error parsing CSV: ${error.message}`]);
      }
    });
  };
  
  // Validate CSV file
  const validateCSV = async (file: File) => {
    try {
      const validationResult = await participantService.validateCSV(file);
      
      if (!validationResult.isValid) {
        setValidationErrors(validationResult.errors);
      } else if (validationResult.duplicateCount > 0) {
        setValidationErrors([
          `Warning: Found ${validationResult.duplicateCount} duplicate MSISDNs in the file. These will be processed but may be skipped if they already exist in the system.`
        ]);
      } else {
        setValidationErrors([]);
      }
    } catch (error: any) {
      setValidationErrors([`Validation error: ${error.message}`]);
    }
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !token) return;
    
    setIsUploading(true);
    setUploadSuccess(undefined); // Use undefined instead of null
    setUploadMessage("");
    
    try {
      const response = await participantService.uploadParticipantsWithValidation(selectedFile, token);
      
      setUploadSuccess(true);
      setUploadMessage(response.message || "Upload successful");
      setUploadStats({
        totalRows: response.clientValidation?.totalRows || response.totalDataRowsProcessed,
        successfulRows: response.successfulRowsImported,
        duplicatesSkipped: response.duplicatesSkippedCount || 0,
        errors: response.errors || []
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
      setPreviewData([]);
    } catch (error: any) {
      setUploadSuccess(false);
      setUploadMessage(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Component render logic...
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default ParticipantUploadComponent;
