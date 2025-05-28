// src/components/ParticipantManagement/ParticipantUploadComponent.tsx - Complete production-ready version
import React, { useState, useCallback } from "react";
import { participantService, type UploadResponse as BackendUploadResponse } from "../../services/participantService";

// Define a more comprehensive frontend UploadResponse type if needed, or ensure BackendUploadResponse includes all fields
interface UploadResponse extends BackendUploadResponse {
    // Add any frontend specific transformations if necessary
    // For now, assume BackendUploadResponse is sufficient and includes all necessary fields
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "500px",
    gap: "15px",
  },
  fileInput: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
  },
  uploadButton: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s ease",
  },
  uploadButtonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  messageContainer: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "4px",
    border: "1px solid transparent",
  },
  successMessage: {
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb",
    color: "#155724",
  },
  errorMessageContainer: { // Renamed for clarity, specifically for error messages section
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    color: "#721c24",
  },
  errorList: {
    listStyleType: "disc",
    marginLeft: "20px",
    marginTop: "10px",
  },
  details: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#555",
  },
  downloadButton: {
    padding: "8px 12px",
    backgroundColor: "#28a745", // Green color for download
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "15px",
    display: "inline-block",
  }
};

const ParticipantUploadComponent: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadResponse(null);
      setError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const generateErrorFileContent = (response: UploadResponse): string => {
    let content = "Participant Upload Error Report\n";
    content += `Audit ID: ${response.auditId}\n`;
    content += `Status: ${response.status}\n`;
    content += `Total Data Rows Processed: ${response.totalDataRowsProcessed}\n`;
    content += `Successfully Imported Rows: ${response.successfulRowsImported}\n`;
    content += `Duplicates Skipped: ${response.duplicatesSkippedCount || 0}\n\n`;

    if (response.errors && response.errors.length > 0) {
      content += "Processing Errors:\n";
      response.errors.forEach(err => {
        content += `- ${err}\n`;
      });
      content += "\n";
    }

    if (response.skippedDuplicateEventDetails && response.skippedDuplicateEventDetails.length > 0) {
      content += "Skipped Duplicate Event Details:\n";
      response.skippedDuplicateEventDetails.forEach(detail => {
        content += `- ${detail}\n`;
      });
      content += "\n";
    }
    
    if ((!response.errors || response.errors.length === 0) && (!response.skippedDuplicateEventDetails || response.skippedDuplicateEventDetails.length === 0) && response.status !== "Success"){
        content += "No specific row errors reported, but upload was not fully successful. General message: " + response.message + "\n";
    }

    return content;
  };

  const handleDownloadErrors = () => {
    if (!uploadResponse) return;

    const errorsExist = (uploadResponse.errors && uploadResponse.errors.length > 0) || 
                        (uploadResponse.skippedDuplicateEventDetails && uploadResponse.skippedDuplicateEventDetails.length > 0);
    
    if (!errorsExist && uploadResponse.status === "Success") {
        // Optionally, prevent download if no errors and successful, or provide a success summary.
        // For now, we allow download of the summary even on success if button is somehow shown.
    }

    const fileContent = generateErrorFileContent(uploadResponse);
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `upload_error_report_${uploadResponse.auditId || "details"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadResponse(null);

    const token = localStorage.getItem("authToken");

    try {
      // Fixed method name from uploadParticipantData to uploadParticipants
      const response: UploadResponse = await participantService.uploadParticipants(selectedFile, token || "");
      setUploadResponse(response);
      if (response.status !== "Success" && response.status !== "Partial Success") {
        setError(response.message || "Upload failed. Check details below.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
      setUploadResponse(null);
    }
    setIsLoading(false);
  }, [selectedFile]);

  const hasErrorsToReport = uploadResponse && 
                           ((uploadResponse.errors && uploadResponse.errors.length > 0) || 
                            (uploadResponse.skippedDuplicateEventDetails && uploadResponse.skippedDuplicateEventDetails.length > 0) ||
                            (uploadResponse.status !== "Success" && uploadResponse.status !== "Partial Success"));

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload Participant Data (CSV)</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={styles.fileInput}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={!selectedFile || isLoading}
          style={isLoading ? {...styles.uploadButton, ...styles.uploadButtonDisabled} : styles.uploadButton}
        >
          {isLoading ? "Uploading..." : "Upload File"}
        </button>
      </form>

      {error && (
        <div style={{...styles.messageContainer, ...styles.errorMessageContainer}}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {uploadResponse && (
        <div style={uploadResponse.status === "Success" || uploadResponse.status === "Partial Success" ? {...styles.messageContainer, ...styles.successMessage} : {...styles.messageContainer, ...styles.errorMessageContainer}}>
          <strong>{uploadResponse.status}:</strong> {uploadResponse.message}
          <div style={styles.details}>
            <p>Audit ID: {uploadResponse.auditId}</p>
            <p>Total Data Rows Processed: {uploadResponse.totalDataRowsProcessed}</p>
            <p>Successfully Imported Rows: {uploadResponse.successfulRowsImported}</p>
            <p>Duplicates Skipped: {uploadResponse.duplicatesSkippedCount || 0}</p>
          </div>
          {(uploadResponse.errors && uploadResponse.errors.length > 0) && (
            <>
              <p style={{marginTop: "10px"}}><strong>Processing Errors:</strong></p>
              <ul style={styles.errorList}>
                {uploadResponse.errors.map((errMsg, index) => (
                  <li key={`proc-err-${index}`}>{errMsg}</li>
                ))}
              </ul>
            </>
          )}
          {(uploadResponse.skippedDuplicateEventDetails && uploadResponse.skippedDuplicateEventDetails.length > 0) && (
            <>
              <p style={{marginTop: "10px"}}><strong>Skipped Duplicate Event Details:</strong></p>
              <ul style={styles.errorList}>
                {uploadResponse.skippedDuplicateEventDetails.map((detailMsg: string, index: number) => (
                  <li key={`skip-err-${index}`}>{detailMsg}</li>
                ))}
              </ul>
            </>
          )}
          {/* Show download button if there are any errors or if the status is not pure success */}
          {hasErrorsToReport && (
             <button onClick={handleDownloadErrors} style={styles.downloadButton}>
               Download Error Report
             </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ParticipantUploadComponent;
