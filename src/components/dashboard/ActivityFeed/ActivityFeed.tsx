// src/components/dashboard/ActivityFeed/ActivityFeed.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { drawService } from '../../../services/drawService';
import './ActivityFeed.css';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface ActivityFeedProps {
  loading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ loading = false }) => {
  const { token } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(loading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!token) return;
      
      try {
        setLocalLoading(true);
        setError(null);
        
        // Fetch real data from API
        const draws = await drawService.listDraws(token);
        
        // Transform draw data into activity items
        const drawActivities: ActivityItem[] = draws.slice(0, 10).map(draw => ({
          id: draw.id,
          type: 'draw',
          title: `MTN Mega Billion Draw #${draw.id.substring(0, 6)}`,
          description: `Draw executed with ${draw.winners?.length || 0} winners selected`,
          timestamp: new Date(draw.createdAt).toLocaleString(),
          status: draw.status
        }));
        
        setActivities(drawActivities);
      } catch (err: any) {
        console.error('Error fetching activities:', err);
        setError(`Failed to load activities: ${err.message}`);
        setActivities([]);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchActivities();
  }, [token]);

  const getStatusClass = (status?: string) => {
    if (!status) return '';
    
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'status-success';
      case 'PENDING':
      case 'IN_PROGRESS':
        return 'status-pending';
      case 'FAILED':
      case 'ERROR':
        return 'status-error';
      default:
        return '';
    }
  };

  const getStatusIcon = (status?: string) => {
    if (!status) return 'help';
    
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'check_circle';
      case 'PENDING':
      case 'IN_PROGRESS':
        return 'pending';
      case 'FAILED':
      case 'ERROR':
        return 'error';
      default:
        return 'help';
    }
  };

  return (
    <div className="activity-feed card">
      <div className="card-header">
        <h3>MTN Mega Billion Activity</h3>
        <button className="btn-link">
          <span className="material-icons">refresh</span>
        </button>
      </div>
      
      <div className="card-body">
        {error && (
          <div className="error-message">
            <span className="material-icons">error</span>
            <span>{error}</span>
          </div>
        )}
        
        {localLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading activities...</p>
          </div>
        ) : activities.length > 0 ? (
          <ul className="activity-list">
            {activities.map((activity) => (
              <li key={activity.id} className="activity-item">
                <div className="activity-icon">
                  <span className="material-icons">
                    {activity.type === 'draw' ? 'shuffle' : 'notifications'}
                  </span>
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <h4 className="activity-title">{activity.title}</h4>
                    {activity.status && (
                      <span className={`activity-status ${getStatusClass(activity.status)}`}>
                        <span className="material-icons status-icon">{getStatusIcon(activity.status)}</span>
                        {activity.status}
                      </span>
                    )}
                  </div>
                  <p className="activity-description">{activity.description}</p>
                  <div className="activity-meta">
                    <span className="activity-time">
                      <span className="material-icons">schedule</span>
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="material-icons empty-icon">event_busy</span>
            <p>No recent MTN Mega Billion activities found.</p>
            <button className="btn btn-primary">Refresh</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
