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
  const { token } = useAuth();
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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">MTN Mega Billion Participant Management</h1>
        <p className="page-description">Upload and manage participants for the MTN Mega Billion promotion</p>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <i className="material-icons">error</i>
          <span>{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">
          <i className="material-icons">check_circle</i>
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="page-content">
        <div className="card upload-panel">
          <div className="card-header">
            <h2>Upload MTN Mega Billion Participants</h2>
          </div>
          <div className="card-body">
            <p className="upload-instructions">
              Upload a CSV file with participant data. The file should have the following columns:
            </p>
            <div className="csv-format">
              <code>MSISDN,Points</code>
              <p className="format-example">Example: 2347012345678,50</p>
            </div>
            
            <div className="upload-form">
              <div className="form-group">
                <label htmlFor="file-upload">Select CSV File:</label>
                <div className="file-input-container">
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="form-control"
                    accept=".csv" 
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <span className="selected-file">
                    {selectedFile ? selectedFile.name : 'No file selected'}
                  </span>
                </div>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <i className="material-icons">cloud_upload</i>
                    <span>Upload Participants</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="card uploads-panel">
          <div className="card-header">
            <h2>Upload History</h2>
            <button className="btn-link">
              <i className="material-icons">refresh</i>
            </button>
          </div>
          
          <div className="card-body">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading upload history...</p>
              </div>
            ) : uploads.length > 0 ? (
              <div className="table-responsive">
                <table className="table uploads-table">
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
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteUpload(upload.id)}
                            disabled={loading}
                          >
                            <i className="material-icons">delete</i>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <i className="material-icons empty-icon">cloud_upload</i>
                <p>No participant uploads found.</p>
                <p>Use the upload panel above to add participants.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="card participants-panel">
          <div className="card-header">
            <h2>MTN Mega Billion Participants</h2>
            <div className="header-actions">
              <span className="participant-count">Total: {totalParticipants}</span>
              <button className="btn-link">
                <i className="material-icons">refresh</i>
              </button>
            </div>
          </div>
          
          <div className="card-body">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading participants...</p>
              </div>
            ) : participants.length > 0 ? (
              <>
                <div className="table-responsive">
                  <table className="table participants-table">
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
                </div>
                
                <div className="pagination">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1 || loading}
                  >
                    <i className="material-icons">navigate_before</i>
                    Previous
                  </button>
                  <span className="page-info">Page {page} of {Math.ceil(totalParticipants / limit)}</span>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={page >= Math.ceil(totalParticipants / limit) || loading}
                  >
                    Next
                    <i className="material-icons">navigate_next</i>
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <i className="material-icons empty-icon">people</i>
                <p>No MTN Mega Billion participants found.</p>
                <p>Upload a CSV file to add participants to the promotion.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantManagementPage;
