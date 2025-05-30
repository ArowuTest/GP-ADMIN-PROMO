// src/components/dashboard/StatusIndicator/StatusIndicator.tsx
import React from 'react';
import './StatusIndicator.css';

interface StatusIndicatorProps {
  status: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusClass = () => {
    switch (status.toLowerCase()) {
      case 'operational':
      case 'active':
      case 'success':
      case 'completed':
        return 'status-operational';
      case 'warning':
      case 'pending':
      case 'in_progress':
        return 'status-warning';
      case 'error':
      case 'failed':
      case 'down':
        return 'status-error';
      default:
        return 'status-unknown';
    }
  };

  const getStatusText = () => {
    switch (status.toLowerCase()) {
      case 'operational':
      case 'active':
      case 'success':
      case 'completed':
        return 'Operational';
      case 'warning':
      case 'pending':
      case 'in_progress':
        return 'Pending';
      case 'error':
      case 'failed':
      case 'down':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`status-indicator ${getStatusClass()}`}>
      <div className="status-dot"></div>
      <span className="status-text">{getStatusText()}</span>
    </div>
  );
};

export default StatusIndicator;
