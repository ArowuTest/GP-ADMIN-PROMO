// src/pages/DrawManagementPage.tsx
import React, { useState, useEffect } from 'react';
import './DrawManagementPage.css';

// This is a placeholder component that will be fully implemented
// with real data integration and API alignment in step 004
const DrawManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="draw-management-container">
      <div className="page-header">
        <h2>Draw Management</h2>
        <p className="page-subtitle">Configure and execute draws</p>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading draw management data...</p>
        </div>
      ) : (
        <div className="draw-management-content">
          <div className="info-card">
            <div className="info-icon">
              <span className="material-icons">info</span>
            </div>
            <div className="info-content">
              <h3>Draw Management Coming Soon</h3>
              <p>This feature is currently being implemented. Check back soon for the ability to configure and execute draws with real-time participant data.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawManagementPage;
