// src/components/dashboard/SystemStatusPanel/SystemStatusPanel.tsx
import React from 'react';
import StatusIndicator, { SystemStatus } from "../StatusIndicator/StatusIndicator";
import './SystemStatusPanel.css';

const SystemStatusPanel: React.FC = () => {
  // In a real implementation, these would be fetched from an API
  const statuses: {name: string, status: SystemStatus, lastUpdated: string}[] = [
    { name: 'Draw Engine', status: 'operational', lastUpdated: '2 minutes ago' },
    { name: 'Participant Database', status: 'operational', lastUpdated: '5 minutes ago' },
    { name: 'Prize Management', status: 'operational', lastUpdated: '10 minutes ago' },
    { name: 'User Authentication', status: 'operational', lastUpdated: '15 minutes ago' }
  ];
  
  return (
    <div className="system-status-panel">
      <h3 className="panel-title">System Status</h3>
      <div className="status-list">
        {statuses.map((item, index) => (
          <StatusIndicator 
            key={index}
            name={item.name}
            status={item.status}
            lastUpdated={item.lastUpdated}
          />
        ))}
      </div>
    </div>
  );
};

export default SystemStatusPanel;
