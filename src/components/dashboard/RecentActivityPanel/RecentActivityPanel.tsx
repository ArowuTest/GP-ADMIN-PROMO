// src/components/dashboard/RecentActivityPanel/RecentActivityPanel.tsx
import React from 'react';
import ActivityFeed from "../ActivityFeed/ActivityFeed";
import './RecentActivityPanel.css';

const RecentActivityPanel: React.FC = () => {
  // In a real implementation, these would be fetched from an API
  const activities = [
    { 
      id: 1, 
      type: 'draw' as const, 
      description: 'Daily Draw executed successfully', 
      user: 'Admin User', 
      timestamp: '2025-05-28T12:30:00Z' 
    },
    { 
      id: 2, 
      type: 'upload' as const, 
      description: 'Participant data uploaded (1,250 records)', 
      user: 'Data Manager', 
      timestamp: '2025-05-28T10:15:00Z' 
    },
    { 
      id: 3, 
      type: 'prize' as const, 
      description: 'Prize structure updated for weekend draws', 
      user: 'Admin User', 
      timestamp: '2025-05-27T16:45:00Z' 
    },
    { 
      id: 4, 
      type: 'user' as const, 
      description: 'New user "Report Viewer" added to the system', 
      user: 'Super Admin', 
      timestamp: '2025-05-27T14:20:00Z' 
    }
  ];
  
  return (
    <div className="recent-activity-panel">
      <div className="panel-header">
        <h3 className="panel-title">Recent Activity</h3>
        <button className="view-all-button">View All</button>
      </div>
      <ActivityFeed activities={activities} />
    </div>
  );
};

export default RecentActivityPanel;
