// src/pages/Dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MetricCard from '../../components/dashboard/MetricCard/MetricCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed/ActivityFeed';
import RecentActivityPanel from '../../components/dashboard/RecentActivityPanel/RecentActivityPanel';
import SystemStatusPanel from '../../components/dashboard/SystemStatusPanel/SystemStatusPanel';
import { drawService } from '../../services/drawService';
import { participantService } from '../../services/participantService';
import './Dashboard.css';

// Define types for dashboard metrics
interface DashboardMetrics {
  totalDraws: number;
  activeDraws: number;
  totalParticipants: number;
  totalWinners: number;
  systemStatus: string;
}

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!token) {
          throw new Error('Authentication token not available');
        }
        
        // Fetch real data from API endpoints
        const [draws, participantStats] = await Promise.all([
          drawService.listDraws(token),
          participantService.getParticipantStats(token)
        ]);
        
        // Calculate metrics from real data
        const activeDraws = draws.filter(draw => draw.status === 'PENDING').length;
        const totalWinners = draws.reduce((total, draw) => total + (draw.winners?.length || 0), 0);
        
        setMetrics({
          totalDraws: draws.length,
          activeDraws,
          totalParticipants: participantStats.totalParticipants,
          totalWinners,
          systemStatus: 'operational'
        });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(`Failed to load dashboard data: ${err.message}`);
        
        // Set fallback metrics if API calls fail
        setMetrics({
          totalDraws: 0,
          activeDraws: 0,
          totalParticipants: 0,
          totalWinners: 0,
          systemStatus: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">MTN Mega Billion Promo Dashboard</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="metrics-container">
        <MetricCard 
          title="Total Draws" 
          value={metrics?.totalDraws || 0} 
          icon="event" 
          loading={loading} 
        />
        <MetricCard 
          title="Active Draws" 
          value={metrics?.activeDraws || 0} 
          icon="event_available" 
          loading={loading} 
        />
        <MetricCard 
          title="Total Participants" 
          value={metrics?.totalParticipants || 0} 
          icon="people" 
          loading={loading} 
        />
        <MetricCard 
          title="Total Winners" 
          value={metrics?.totalWinners || 0} 
          icon="emoji_events" 
          loading={loading} 
        />
      </div>
      
      <div className="dashboard-panels">
        <div className="panel-left">
          <SystemStatusPanel status={metrics?.systemStatus || 'loading'} loading={loading} />
          <RecentActivityPanel loading={loading} />
        </div>
        <div className="panel-right">
          <ActivityFeed loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
