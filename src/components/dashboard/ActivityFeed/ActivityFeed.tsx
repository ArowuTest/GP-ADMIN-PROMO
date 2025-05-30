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
          title: `Draw ${draw.id.substring(0, 8)}`,
          description: `Draw executed with ${draw.winners?.length || 0} winners`,
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

  return (
    <div className="activity-feed">
      <h2 className="activity-feed-title">Recent Activity</h2>
      
      {error && (
        <div className="activity-feed-error">
          {error}
        </div>
      )}
      
      {localLoading ? (
        <div className="activity-feed-loading">
          <div className="loading-spinner"></div>
          <p>Loading activities...</p>
        </div>
      ) : activities.length > 0 ? (
        <ul className="activity-list">
          {activities.map((activity) => (
            <li key={activity.id} className="activity-item">
              <div className="activity-icon">
                <span className="material-icons">
                  {activity.type === 'draw' ? 'event' : 'notifications'}
                </span>
              </div>
              <div className="activity-content">
                <h3 className="activity-title">{activity.title}</h3>
                <p className="activity-description">{activity.description}</p>
                <div className="activity-meta">
                  <span className="activity-time">{activity.timestamp}</span>
                  {activity.status && (
                    <span className={`activity-status ${getStatusClass(activity.status)}`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="activity-feed-empty">
          <p>No recent activities found.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
