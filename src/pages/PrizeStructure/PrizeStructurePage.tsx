// src/pages/PrizeStructurePage.tsx
import React, { useState, useEffect } from 'react';
import './PrizeStructurePage.css';

// This is a placeholder component that will be fully implemented
// with real data integration and API alignment in step 006
const PrizeStructurePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="prize-structure-container">
      <div className="page-header">
        <h2>Prize Structure Management</h2>
        <p className="page-subtitle">Configure and manage prize structures</p>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading prize structure data...</p>
        </div>
      ) : (
        <div className="prize-structure-content">
          <div className="info-card">
            <div className="info-icon">
              <span className="material-icons">info</span>
            </div>
            <div className="info-content">
              <h3>Prize Structure Management Coming Soon</h3>
              <p>This feature is currently being implemented. Check back soon for the ability to create and manage day-specific prize structures with winner and runner-up configurations.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrizeStructurePage;
