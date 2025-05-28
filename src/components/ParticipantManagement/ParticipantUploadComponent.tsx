import React, { useState, useCallback } from "react";
import { participantService, type UploadResponse as BackendUploadResponse, type CSVValidationResult, type CSVParticipantRow } from "../../services/participantService";

// Define a more comprehensive frontend UploadResponse type
interface UploadResponse extends BackendUploadResponse {
  clientValidation?: {
    totalRows: number;
    validRowCount: number;
    invalidRowCount: number;
    duplicateCount: number;
    errors: string[];
  };
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
  errorMessageContainer: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    color: "#721c24",
  },
  warningMessageContainer: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeeba",
    color: "#856404",
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
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "15px",
    display: "inline-block",
  },
  previewContainer: {
    marginTop: "20px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "15px",
    maxHeight: "300px",
    overflowY: "auto",
  },
  previewTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  previewHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
    textAlign: "left",
    padding: "8px",
    borderBottom: "1px solid #ddd",
  },
  previewCell: {
    padding: "8px",
    borderBottom: "1px solid #ddd",
  },
  validRow: {
    backgroundColor: "#f0fff0",
  },
  invalidRow: {
    backgroundColor: "#fff0f0",
  },
  duplicateRow: {
    backgroundColor: "#ffffd0",
  },
  previewStats: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "14px",
  },
  statItem: {
    padding: "5px 10px",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  totalStat: {
    backgroundColor: "#e9ecef",
    color: "#495057",
  },
  validStat: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  invalidStat: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  duplicateStat: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  validationProgress: {
    marginTop: "10px",
    height: "10px",
    borderRadius: "5px",
    overflow: "hidden",
    backgroundColor: "#e9ecef",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#28a745",
    transition: "width 0.3s ease",
  }
};

const ParticipantUploadComponent: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<CSVValidationResult | null>(null);
  const [previewData, setPreviewData] = useState<CSVParticipantRow[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Reset state when file changes
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setUploadResponse(null);
      setError(null);
      setValidationResult(null);
      setPreviewData([]);
      setShowPreview(false);
      
      // Automatically validate the file
      await validateFile(file);
    } else {
      setSelectedFile(null);
      setValidationResult(null);
      setPreviewData([]);
      setShowPreview(false);
    }
  };

  // Validate the selected file
  const validateFile = async (file: File) => {
    if (!file) return;
    
    setIsValidating(true);
    setError(null);
    
    try {
      const result = await participantService.validateCSV(file);
      setValidationResult(result);
      
      // Set preview data (limited to first 100 rows for performance)
      const previewRows = [...result.data].slice(0, 100);
      setPreviewData(previewRows);
      setShowPreview(true);
      
      // Show validation errors if any
      if (!result.isValid) {
        setError(`CSV validation found ${result.errors.length} issues. Please review before uploading.`);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during file validation.");
      setValidationResult(null);
      setPreviewData([]);
      setShowPreview(false);
    } finally {
      setIsValidating(false);
    }
  };

  // Generate error file content
  const generateErrorFileContent = (response: UploadResponse): string => {
    let content = "Participant Upload Error Report\n";
    content += `Audit ID: ${response.auditId}\n`;
    content += `Status: ${response.status}\n`;
    content += `Total Data Rows Processed: ${response.totalDataRowsProcessed}\n`;
    content += `Successfully Imported Rows: ${response.successfulRowsImported}\n`;
    content += `Duplicates Skipped: ${response.duplicatesSkippedCount || 0}\n\n`;

    // Add client-side validation results if available
    if (response.clientValidation) {
      content += "Client Validation Results:\n";
      content += `Total Rows: ${response.clientValidation.totalRows}\n`;
      content += `Valid Rows: ${response.clientValidation.validRowCount}\n`;
      content += `Invalid Rows: ${response.clientValidation.invalidRowCount}\n`;
      content += `Duplicate Rows: ${response.clientValidation.duplicateCount}\n\n`;
      
      if (response.clientValidation.errors && response.clientValidation.errors.length > 0) {
        content += "Client Validation Errors:\n";
        response.clientValidation.errors.forEach(err => {
          content += `- ${err}\n`;
        });
        content += "\n";
      }
    }

    // Add server-side errors
    if (response.errors && response.errors.length > 0) {
      content += "Server Processing Errors:\n";
      response.errors.forEach(err => {
        content += `- ${err}\n`;
      });
      content += "\n";
    }

    // Add duplicate details
    if (response.skippedDuplicateEventDetails && response.skippedDuplicateEventDetails.length > 0) {
      content += "Skipped Duplicate Event Details:\n";
      response.skippedDuplicateEventDetails.forEach(detail => {
        content += `- ${detail}\n`;
      });
      content += "\n";
    }
    
    if ((!response.errors || response.errors.length === 0) && 
        (!response.skippedDuplicateEventDetails || response.skippedDuplicateEventDetails.length === 0) && 
        response.status !== "Success"){
        content += "No specific row errors reported, but upload was not fully successful. General message: " + response.message + "\n";
    }

    return content;
  };

  // Handle download of error report
  const handleDownloadErrors = () => {
    if (!uploadResponse) return;

    const errorsExist = (uploadResponse.errors && uploadResponse.errors.length > 0) || 
                        (uploadResponse.skippedDuplicateEventDetails && uploadResponse.skippedDuplicateEventDetails.length > 0) ||
                        (uploadResponse.clientValidation && uploadResponse.clientValidation.errors && uploadResponse.clientValidation.errors.length > 0);
    
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

  // Handle form submission
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    // If validation failed with critical errors, prevent upload
    if (validationResult && !validationResult.isValid && 
        validationResult.errors.some(err => err.includes('Missing required columns'))) {
      setError("Please fix critical validation errors before uploading.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadResponse(null);

    const token = localStorage.getItem("authToken");

    try {
      // Use the enhanced upload method with validation
      const response: UploadResponse = await participantService.uploadParticipantsWithValidation(selectedFile, token || "");
      setUploadResponse(response);
      if (response.status !== "Success" && response.status !== "Partial Success") {
        setError(response.message || "Upload failed. Check details below.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
      setUploadResponse(null);
    }
    setIsLoading(false);
  }, [selectedFile, validationResult]);

  // Determine if there are errors to report
  const hasErrorsToReport = uploadResponse && 
                           ((uploadResponse.errors && uploadResponse.errors.length > 0) || 
                            (uploadResponse.skippedDuplicateEventDetails && uploadResponse.skippedDuplicateEventDetails.length > 0) ||
                            (uploadResponse.clientValidation && uploadResponse.clientValidation.errors && uploadResponse.clientValidation.errors.length > 0) ||
                            (uploadResponse.status !== "Success" && uploadResponse.status !== "Partial Success"));

  // Calculate validation progress bar percentage
  const getValidationPercentage = () => {
    if (!validationResult) return 0;
    const { validRowCount, totalRows } = validationResult;
    return (validRowCount / totalRows) * 100;
  };

  // Determine row style based on validation status
  const getRowStyle = (row: CSVParticipantRow) => {
    if (!validationResult) return {};
    
    // Check if this is a duplicate
    const isDuplicate = validationResult.duplicates.some(d => d.msisdn === row.msisdn);
    if (isDuplicate) return styles.duplicateRow;
    
    // Check if this is an invalid row
    const isInvalid = validationResult.invalidRows.some(r => r === row);
    if (isInvalid) return styles.invalidRow;
    
    // Otherwise it's valid
    return styles.validRow;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload Participant Data (CSV)</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={styles.fileInput}
          disabled={isLoading || isValidating}
        />
        <button 
          type="submit" 
          disabled={!selectedFile || isLoading || isValidating || (validationResult && !validationResult.isValid && validationResult.errors.some(err => err.includes('Missing required columns')))}
          style={(isLoading || isValidating || !selectedFile) ? {...styles.uploadButton, ...styles.uploadButtonDisabled} : styles.uploadButton}
        >
          {isLoading ? "Uploading..." : isValidating ? "Validating..." : "Upload File"}
        </button>
      </form>

      {error && (
        <div style={{...styles.messageContainer, ...styles.errorMessageContainer}}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* File Preview Section */}
      {showPreview && validationResult && (
        <div style={styles.previewContainer}>
          <h3>File Preview</h3>
          
          {/* Validation Statistics */}
          <div style={styles.previewStats}>
            <span style={{...styles.statItem, ...styles.totalStat}}>
              Total: {validationResult.totalRows}
            </span>
            <span style={{...styles.statItem, ...styles.validStat}}>
              Valid: {validationResult.validRowCount}
            </span>
            <span style={{...styles.statItem, ...styles.invalidStat}}>
              Invalid: {validationResult.invalidRowCount}
            </span>
            <span style={{...styles.statItem, ...styles.duplicateStat}}>
              Duplicates: {validationResult.duplicateCount}
            </span>
          </div>
          
          {/* Validation Progress Bar */}
          <div style={styles.validationProgress}>
            <div 
              style={{
                ...styles.progressBar,
                width: `${getValidationPercentage()}%`,
                backgroundColor: validationResult.isValid ? '#28a745' : validationResult.validRowCount > 0 ? '#ffc107' : '#dc3545'
              }}
            />
          </div>
          
          {/* Preview Table */}
          {previewData.length > 0 && (
            <table style={styles.previewTable}>
              <thead>
                <tr>
                  <th style={styles.previewHeader}>Row</th>
                  <th style={styles.previewHeader}>MSISDN</th>
                  <th style={styles.previewHeader}>Recharge Amount</th>
                  <th style={styles.previewHeader}>Recharge Date</th>
                  <th style={styles.previewHeader}>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} style={getRowStyle(row)}>
                    <td style={styles.previewCell}>{i + 2}</td>
                    <td style={styles.previewCell}>{row.msisdn}</td>
                    <td style={styles.previewCell}>{row.rechargeAmount}</td>
                    <td style={styles.previewCell}>{row.rechargeDate}</td>
                    <td style={styles.previewCell}>
                      {validationResult.duplicates.some(d => d.msisdn === row.msisdn) 
                        ? "Duplicate" 
                        : validationResult.invalidRows.some(r => r === row)
                          ? "Invalid"
                          : "Valid"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {/* Validation Errors */}
          {validationResult.errors.length > 0 && (
            <div style={{...styles.messageContainer, ...styles.warningMessageContainer, marginTop: "15px"}}>
              <p><strong>Validation Issues:</strong></p>
              <ul style={styles.errorList}>
                {validationResult.errors.slice(0, 10).map((err, i) => (
                  <li key={`val-err-${i}`}>{err}</li>
                ))}
                {validationResult.errors.length > 10 && (
                  <li>...and {validationResult.errors.length - 10} more issues</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Upload Response Section */}
      {uploadResponse && (
        <div style={uploadResponse.status === "Success" || uploadResponse.status === "Partial Success" ? {...styles.messageContainer, ...styles.successMessage} : {...styles.messageContainer, ...styles.errorMessageContainer}}>
          <strong>{uploadResponse.status}:</strong> {uploadResponse.message}
          <div style={styles.details}>
            <p>Audit ID: {uploadResponse.auditId}</p>
            <p>Total Data Rows Processed: {uploadResponse.totalDataRowsProcessed}</p>
            <p>Successfully Imported Rows: {uploadResponse.successfulRowsImported}</p>
            <p>Duplicates Skipped: {uploadResponse.duplicatesSkippedCount || 0}</p>
          </div>
          
          {/* Client Validation Results */}
          {uploadResponse.clientValidation && (
            <div style={{marginTop: "15px"}}>
              <p><strong>Client Validation Results:</strong></p>
              <div style={styles.details}>
                <p>Total Rows: {uploadResponse.clientValidation.totalRows}</p>
                <p>Valid Rows: {uploadResponse.clientValidation.validRowCount}</p>
                <p>Invalid Rows: {uploadResponse.clientValidation.invalidRowCount}</p>
                <p>Duplicate Rows: {uploadResponse.clientValidation.duplicateCount}</p>
              </div>
            </div>
          )}
          
          {/* Server Processing Errors */}
          {(uploadResponse.errors && uploadResponse.errors.length > 0) && (
            <div>
              <p style={{marginTop: "10px"}}><strong>Server Processing Errors:</strong></p>
              <ul style={styles.errorList}>
                {uploadResponse.errors.map((errMsg, i) => (
                  <li key={`proc-err-${i}`}>{errMsg}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Duplicate Event Details */}
          {(uploadResponse.skippedDuplicateEventDetails && uploadResponse.skippedDuplicateEventDetails.length > 0) && (
            <div>
              <p style={{marginTop: "10px"}}><strong>Skipped Duplicate Event Details:</strong></p>
              <ul style={styles.errorList}>
                {uploadResponse.skippedDuplicateEventDetails.map((detailMsg: string, i: number) => (
                  <li key={`skip-err-${i}`}>{detailMsg}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Download Error Report Button */}
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
