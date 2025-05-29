// src/pages/ReportsPage.tsx
import React, { useState, useEffect } from 'react';
import './ReportsPage.css';

// This is a placeholder component that will be fully implemented
// with real data integration and API alignment in a future step
const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="reports-container">
      <div className="page-header">
        <h2>Reports</h2>
        <p className="page-subtitle">View and export system reports</p>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reports data...</p>
        </div>
      ) : (
        <div className="reports-content">
          <div className="info-card">
            <div className="info-icon">
              <span className="material-icons">info</span>
            </div>
            <div className="info-content">
              <h3>Reports Coming Soon</h3>
              <p>This feature is currently being implemented. Check back soon for the ability to view and export various system reports including winners, participants, and draw history.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
