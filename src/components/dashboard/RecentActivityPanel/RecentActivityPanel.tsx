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
            title: `MTN Mega Billion Draw #${draw.id.substring(0, 6)}`,
            description: `Prize structure: ${draw.prizeStructureName || 'Standard'}`,
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
    <div className="recent-activity-panel card">
      <div className="card-header">
        <h3>Recent MTN Mega Billion Draws</h3>
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
            <p>Loading recent activities...</p>
          </div>
        ) : activities.length > 0 ? (
          <ul className="recent-activity-list">
            {activities.map((activity) => (
              <li key={activity.id} className="recent-activity-item">
                <div className="activity-icon">
                  <span className="material-icons">
                    {activity.type === 'draw' ? 'shuffle' : 'notifications'}
                  </span>
                </div>
                <div className="activity-details">
                  <h4 className="activity-title">{activity.title}</h4>
                  <p className="activity-description">{activity.description}</p>
                  <div className="activity-meta">
                    <span className="activity-timestamp">
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
            <p>No recent MTN Mega Billion draws found.</p>
            <button className="btn btn-primary">Refresh</button>
          </div>
        )}
      </div>
      
      <div className="card-footer">
        <a href="/draw-management" className="view-all-link">
          <span className="material-icons">visibility</span>
          View All MTN Mega Billion Draws
        </a>
      </div>
    </div>
  );
};

export default RecentActivityPanel;
