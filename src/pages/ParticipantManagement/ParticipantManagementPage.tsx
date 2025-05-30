// src/pages/ParticipantManagement/ParticipantManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { participantService } from '../../services/participantService';
import './ParticipantManagementPage.css';

interface ParticipantData {
  id: string;
  msisdn: string;
  points: number;
  uploadId: string;
  createdAt: string;
  updatedAt: string;
}

interface UploadAudit {
  id: string;
  userId: string;
  userName: string;
  fileName: string;
  recordCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const ParticipantManagementPage: React.FC = () => {
  const { token } = useAuth(); // Removed unused 'user' variable
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [uploads, setUploads] = useState<UploadAudit[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(50);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch participants and upload audits in parallel
        const [participantsResponse, uploadsData] = await Promise.all([
          participantService.listParticipants(page, limit, token),
          participantService.listUploadAudits(token)
        ]);
        
        setParticipants(participantsResponse.data);
        setTotalParticipants(participantsResponse.total);
        setUploads(uploadsData);
      } catch (err: any) {
        console.error('Error fetching participant data:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, page, limit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!token || !selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Upload the file
      const result = await participantService.uploadParticipants(selectedFile, token);
      
      // Refresh the uploads list
      const uploadsData = await participantService.listUploadAudits(token);
      setUploads(uploadsData);
      
      setSuccessMessage(`File uploaded successfully. ${result.successfulRowsImported} records imported, ${result.duplicatesSkippedCount} duplicates skipped.`);
      setSelectedFile(null);
      
      // Reset the file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err: any) {
      console.error('Error uploading participants:', err);
      setError(`Failed to upload file: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUpload = async (uploadId: string) => {
    if (!token) return;
    
    if (!window.confirm('Are you sure you want to delete this upload? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Delete the upload
      await participantService.deleteUpload(uploadId, token);
      
      // Refresh the uploads list
      const uploadsData = await participantService.listUploadAudits(token);
      setUploads(uploadsData);
      
      // Refresh the participants list
      const participantsResponse = await participantService.listParticipants(page, limit, token);
      setParticipants(participantsResponse.data);
      setTotalParticipants(participantsResponse.total);
      
      setSuccessMessage('Upload deleted successfully');
    } catch (err: any) {
      console.error('Error deleting upload:', err);
      setError(`Failed to delete upload: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format MSISDN to show only first 3 and last 3 digits
  const formatMSISDN = (msisdn: string) => {
    if (msisdn.length <= 6) return msisdn;
    return `${msisdn.substring(0, 3)}****${msisdn.substring(msisdn.length - 3)}`;
  };

  return (
    <div className="participant-management-page">
      <h1>Participant Management</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <div className="upload-panel">
        <h2>Upload Participants</h2>
        <p>Upload a CSV file with participant data. The file should have the following columns: MSISDN, Points</p>
        
        <div className="upload-form">
          <div className="form-group">
            <label htmlFor="file-upload">Select CSV File:</label>
            <input 
              type="file" 
              id="file-upload" 
              accept=".csv" 
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          
          <button 
            className="upload-button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
      
      <div className="uploads-panel">
        <h2>Upload History</h2>
        
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Loading upload history...</p>
          </div>
        ) : uploads.length > 0 ? (
          <table className="uploads-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Records</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map(upload => (
                <tr key={upload.id}>
                  <td>{upload.fileName}</td>
                  <td>{upload.userName}</td>
                  <td>{new Date(upload.createdAt).toLocaleString()}</td>
                  <td>{upload.recordCount}</td>
                  <td>
                    <span className={`status-badge status-${upload.status.toLowerCase()}`}>
                      {upload.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteUpload(upload.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-uploads-message">
            <p>No uploads found.</p>
          </div>
        )}
      </div>
      
      <div className="participants-panel">
        <h2>Participants List</h2>
        
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Loading participants...</p>
          </div>
        ) : participants.length > 0 ? (
          <>
            <table className="participants-table">
              <thead>
                <tr>
                  <th>MSISDN</th>
                  <th>Points</th>
                  <th>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(participant => (
                  <tr key={participant.id}>
                    <td>{formatMSISDN(participant.msisdn)}</td>
                    <td>{participant.points}</td>
                    <td>{new Date(participant.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="pagination">
              <button 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </button>
              <span>Page {page} of {Math.ceil(totalParticipants / limit)}</span>
              <button 
                onClick={() => setPage(prev => prev + 1)}
                disabled={page >= Math.ceil(totalParticipants / limit) || loading}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="no-participants-message">
            <p>No participants found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantManagementPage;
