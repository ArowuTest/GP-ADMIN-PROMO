// src/components/dashboard/RecentActivityPanel/RecentActivityPanel.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { drawService } from '../../../services/drawService';
import './RecentActivityPanel.css';

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: string;
}

interface RecentActivityPanelProps {
  loading?: boolean;
}

const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({ loading = false }) => {
  const { token } = useAuth();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(loading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!token) return;
      
      try {
        setLocalLoading(true);
        setError(null);
        
        // Fetch real data from API
        const draws = await drawService.listDraws(token);
        
        // Transform to activity format
        const recentActivities: RecentActivity[] = draws
          .slice(0, 5)
          .map(draw => ({
            id: draw.id,
            title: `Draw ${draw.id.substring(0, 8)}`,
            description: `Prize structure: ${draw.prizeStructureName}`,
            timestamp: new Date(draw.createdAt).toLocaleString(),
            type: 'draw'
          }));
        
        setActivities(recentActivities);
      } catch (err: any) {
        console.error('Error fetching recent activities:', err);
        setError(`Failed to load recent activities: ${err.message}`);
        setActivities([]);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchRecentActivities();
  }, [token]);

  return (
    <div className="recent-activity-panel">
      <h2 className="panel-title">Recent Activities</h2>
      
      {error && (
        <div className="activity-error">
          {error}
        </div>
      )}
      
      {localLoading ? (
        <div className="activity-loading">
          <div className="loading-spinner"></div>
          <p>Loading recent activities...</p>
        </div>
      ) : activities.length > 0 ? (
        <ul className="recent-activity-list">
          {activities.map((activity) => (
            <li key={activity.id} className="recent-activity-item">
              <div className="activity-icon">
                <span className="material-icons">
                  {activity.type === 'draw' ? 'event' : 'notifications'}
                </span>
              </div>
              <div className="activity-details">
                <h3 className="activity-title">{activity.title}</h3>
                <p className="activity-description">{activity.description}</p>
                <span className="activity-timestamp">{activity.timestamp}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-activities">
          <p>No recent activities found.</p>
        </div>
      )}
      
      <div className="view-all-link">
        <a href="/draw-management">View All Draws</a>
      </div>
    </div>
  );
};

export default RecentActivityPanel;
