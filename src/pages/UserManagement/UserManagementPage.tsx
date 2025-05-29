// src/pages/UserManagementPage.tsx
import React, { useState, useEffect } from 'react';
import './UserManagementPage.css';

// This is a placeholder component that will be fully implemented
// with real data integration and API alignment in a future step
const UserManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="user-management-container">
      <div className="page-header">
        <h2>User Management</h2>
        <p className="page-subtitle">Manage admin users and permissions</p>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user management data...</p>
        </div>
      ) : (
        <div className="user-management-content">
          <div className="info-card">
            <div className="info-icon">
              <span className="material-icons">info</span>
            </div>
            <div className="info-content">
              <h3>User Management Coming Soon</h3>
              <p>This feature is currently being implemented. Check back soon for the ability to create, edit, and manage admin users with role-based permissions.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
