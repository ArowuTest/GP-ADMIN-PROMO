// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MetricCard from "../../components/dashboard/MetricCard/MetricCard";
import ActivityFeed from "../../components/dashboard/ActivityFeed/ActivityFeed";
import StatusIndicator from '../../components/dashboard/StatusIndicator/StatusIndicator';
import './Dashboard.css';

interface DashboardMetrics {
  totalDraws: number;
  activeDraws: number;
  totalParticipants: number;
  totalWinners: number;
  systemStatus: 'operational' | 'maintenance' | 'issue';
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalDraws: 0,
    activeDraws: 0,
    totalParticipants: 0,
    totalWinners: 0,
    systemStatus: 'operational'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    // For now, we'll simulate loading with mock data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setMetrics({
          totalDraws: 24,
          activeDraws: 2,
          totalParticipants: 15782,
          totalWinners: 342,
          systemStatus: 'operational'
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {user?.fullName || user?.username || 'Admin'}</h2>
        <p className="dashboard-subtitle">MTN Mega Billion Promo Admin Portal Dashboard</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="metrics-container">
            <MetricCard 
              title="Total Draws" 
              value={metrics.totalDraws} 
              icon="casino" 
              trend="up" 
              trendValue="8%" 
            />
            <MetricCard 
              title="Active Draws" 
              value={metrics.activeDraws} 
              icon="event_available" 
              trend="same" 
              trendValue="0%" 
            />
            <MetricCard 
              title="Total Participants" 
              value={metrics.totalParticipants.toLocaleString()} 
              icon="people" 
              trend="up" 
              trendValue="12%" 
            />
            <MetricCard 
              title="Total Winners" 
              value={metrics.totalWinners.toLocaleString()} 
              icon="emoji_events" 
              trend="up" 
              trendValue="5%" 
            />
          </div>

          <div className="dashboard-content">
            <div className="dashboard-section">
              <h3>System Status</h3>
              <StatusIndicator status={metrics.systemStatus} />
            </div>

            <div className="dashboard-section">
              <h3>Recent Activity</h3>
              <ActivityFeed />
            </div>
          </div>

          <div className="dashboard-footer">
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-button">
                  <span className="material-icons">add</span>
                  New Draw
                </button>
                <button className="action-button">
                  <span className="material-icons">upload_file</span>
                  Upload Participants
                </button>
                <button className="action-button">
                  <span className="material-icons">leaderboard</span>
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
