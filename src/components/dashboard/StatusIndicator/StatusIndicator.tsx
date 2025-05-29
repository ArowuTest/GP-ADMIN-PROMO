// src/components/dashboard/StatusIndicator/StatusIndicator.tsx
import React from 'react';
import './StatusIndicator.css';

export type SystemStatus = 'operational' | 'maintenance' | 'issue';

interface StatusIndicatorProps {
  status: SystemStatus;
  name?: string;
  lastUpdated?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, name, lastUpdated }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'operational':
        return {
          label: name ? `${name}: Operational` : 'All Systems Operational',
          icon: 'check_circle',
          description: 'All services are running normally.'
        };
      case 'maintenance':
        return {
          label: name ? `${name}: Maintenance` : 'Scheduled Maintenance',
          icon: 'engineering',
          description: 'Some services may be temporarily unavailable due to scheduled maintenance.'
        };
      case 'issue':
        return {
          label: name ? `${name}: Issue Detected` : 'System Issues Detected',
          icon: 'error',
          description: 'We are currently experiencing some technical difficulties. Our team is working to resolve them.'
        };
      default:
        return {
          label: 'Status Unknown',
          icon: 'help',
          description: 'Unable to determine system status.'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`status-indicator ${status}`}>
      <div className="status-icon">
        <span className="material-icons">{statusInfo.icon}</span>
      </div>
      <div className="status-content">
        <h4 className="status-label">{statusInfo.label}</h4>
        <p className="status-description">{statusInfo.description}</p>
        {lastUpdated && <p className="status-timestamp">Last updated: {lastUpdated}</p>}
      </div>
    </div>
  );
};

export default StatusIndicator;
