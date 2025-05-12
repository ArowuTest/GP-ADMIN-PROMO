import React, { useState, useCallback } from "react";
// Removed useAuth as token will be fetched from localStorage directly
import { participantService, type UploadResponse } from "../../services/participantService";

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
  errorMessage: {
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
  }
};

const ParticipantUploadComponent: React.FC = () => {
  // const { token } = useAuth(); // Removed: Token will be fetched from localStorage
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadResponse(null); // Reset previous response
      setError(null); // Reset previous error
    } else {
      setSelectedFile(null);
    }
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

    const token = localStorage.getItem("authToken"); // Fetch token from localStorage

    try {
      const response = await participantService.uploadParticipantData(selectedFile, token);
      setUploadResponse(response);
      if (response.status !== "Success" && response.status !== "Partial Success") {
        setError(response.message || "Upload failed. Check details below.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
      setUploadResponse(null);
    }
    setIsLoading(false);
  }, [selectedFile]); // Removed token from dependencies as it's fetched inside

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
        <div style={{...styles.messageContainer, ...styles.errorMessage}}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {uploadResponse && (
        <div style={uploadResponse.status === "Success" || uploadResponse.status === "Partial Success" ? {...styles.messageContainer, ...styles.successMessage} : {...styles.messageContainer, ...styles.errorMessage}}>
          <strong>{uploadResponse.status}:</strong> {uploadResponse.message}
          <div style={styles.details}>
            <p>Audit ID: {uploadResponse.audit_id}</p>
            <p>Total Data Rows Processed: {uploadResponse.total_data_rows_processed}</p>
            <p>Successfully Imported Rows: {uploadResponse.successful_rows_imported}</p>
          </div>
          {uploadResponse.errors && uploadResponse.errors.length > 0 && (
            <>
              <p style={{marginTop: "10px"}}><strong>Details:</strong></p>
              <ul style={styles.errorList}>
                {uploadResponse.errors.map((errMsg, index) => (
                  <li key={index}>{errMsg}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ParticipantUploadComponent;

