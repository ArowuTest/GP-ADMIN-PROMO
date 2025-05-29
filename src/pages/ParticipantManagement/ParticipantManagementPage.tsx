// src/pages/ParticipantManagementPage.tsx
import React, { useState, useEffect } from 'react';
import './ParticipantManagementPage.css';

// This is a placeholder component that will be fully implemented
// with real data integration and API alignment in step 005
const ParticipantManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="participant-management-container">
      <div className="page-header">
        <h2>Participant Management</h2>
        <p className="page-subtitle">Upload and manage participant data</p>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading participant management data...</p>
        </div>
      ) : (
        <div className="participant-management-content">
          <div className="info-card">
            <div className="info-icon">
              <span className="material-icons">info</span>
            </div>
            <div className="info-content">
              <h3>Participant Management Coming Soon</h3>
              <p>This feature is currently being implemented. Check back soon for the ability to upload and manage participant data with CSV validation and audit trail.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantManagementPage;
