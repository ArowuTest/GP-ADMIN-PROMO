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
    <div className="system-status-panel">
      <h2 className="panel-title">System Status</h2>
      
      {loading ? (
        <div className="status-loading">
          <div className="loading-spinner"></div>
          <p>Loading system status...</p>
        </div>
      ) : (
        <div className="status-content">
          <div className="status-item">
            <span className="status-label">MTN Mega Billion Promo:</span>
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
            <span className="status-label">SMS Notification:</span>
            <StatusIndicator status="pending" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatusPanel;
