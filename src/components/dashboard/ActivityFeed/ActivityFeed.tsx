// src/components/dashboard/ActivityFeed/ActivityFeed.tsx
import React from 'react';
import './ActivityFeed.css';

export interface ActivityItem {
  id: string | number;
  type: 'draw' | 'upload' | 'user' | 'prize';
  action?: string;
  description?: string;
  user: string;
  timestamp: string;
  details?: string;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities: propActivities }) => {
  // Mock activity data - in a real implementation, this would come from an API
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'draw',
      action: 'Draw Executed',
      user: 'John Admin',
      timestamp: '2025-05-28T10:30:00',
      details: 'Daily Draw #24 with 1,250 participants'
    },
    {
      id: '2',
      type: 'upload',
      action: 'Participants Uploaded',
      user: 'Sarah Manager',
      timestamp: '2025-05-28T09:15:00',
      details: '2,500 new participants added'
    },
    {
      id: '3',
      type: 'prize',
      action: 'Prize Structure Updated',
      user: 'John Admin',
      timestamp: '2025-05-27T16:45:00',
      details: 'Added 2 new prize tiers'
    },
    {
      id: '4',
      type: 'user',
      action: 'User Created',
      user: 'Super Admin',
      timestamp: '2025-05-27T14:20:00',
      details: 'New admin user "Sarah Manager" added'
    },
    {
      id: '5',
      type: 'draw',
      action: 'Draw Scheduled',
      user: 'John Admin',
      timestamp: '2025-05-27T11:10:00',
      details: 'Weekly Draw #4 scheduled for 2025-05-30'
    }
  ];

  // Use provided activities or fall back to default
  const activities = propActivities || defaultActivities;

  // Function to get icon based on activity type
  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'draw':
        return 'casino';
      case 'upload':
        return 'upload_file';
      case 'user':
        return 'person';
      case 'prize':
        return 'emoji_events';
      default:
        return 'info';
    }
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="activity-feed">
      {activities.length === 0 ? (
        <div className="no-activity">
          <span className="material-icons">history</span>
          <p>No recent activity</p>
        </div>
      ) : (
        <ul className="activity-list">
          {activities.map((activity) => (
            <li key={activity.id.toString()} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                <span className="material-icons">{getActivityIcon(activity.type)}</span>
              </div>
              <div className="activity-content">
                <div className="activity-header">
                  <span className="activity-action">{activity.action || activity.description}</span>
                  <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                </div>
                <div className="activity-user">by {activity.user}</div>
                {activity.details && <div className="activity-details">{activity.details}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="view-all-container">
        <button className="view-all-button">View All Activity</button>
      </div>
    </div>
  );
};

export default ActivityFeed;
