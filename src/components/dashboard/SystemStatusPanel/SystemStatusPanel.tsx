// src/components/dashboard/SystemStatusPanel/SystemStatusPanel.tsx
import React from 'react';
import StatusIndicator from '../StatusIndicator/StatusIndicator';
import './SystemStatusPanel.css';

interface SystemStatusPanelProps {
  status: string;
  loading?: boolean;
}

const SystemStatusPanel: React.FC<SystemStatusPanelProps> = ({ status, loading = false }) => {
  return (
    <div className="system-status-panel card">
      <div className="card-header">
        <h3>MTN Mega Billion System Status</h3>
        <button className="btn-link">
          <span className="material-icons">refresh</span>
        </button>
      </div>
      
      {loading ? (
        <div className="card-body">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading system status...</p>
          </div>
        </div>
      ) : (
        <div className="card-body">
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">MTN Mega Billion Portal:</span>
              <StatusIndicator status={status} />
            </div>
            
            <div className="status-item">
              <span className="status-label">Backend API:</span>
              <StatusIndicator status={status} />
            </div>
            
            <div className="status-item">
              <span className="status-label">Draw Engine:</span>
              <StatusIndicator status={status} />
            </div>
            
            <div className="status-item">
              <span className="status-label">Participant Database:</span>
              <StatusIndicator status={status} />
            </div>
            
            <div className="status-item">
              <span className="status-label">SMS Notification Service:</span>
              <StatusIndicator status="pending" />
            </div>
            
            <div className="status-item">
              <span className="status-label">PostHog Integration:</span>
              <StatusIndicator status="pending" />
            </div>
          </div>
          
          <div className="status-footer">
            <span className="status-timestamp">Last updated: {new Date().toLocaleTimeString()}</span>
            <button className="btn btn-sm btn-primary">
              <span className="material-icons">refresh</span>
              Refresh Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatusPanel;
