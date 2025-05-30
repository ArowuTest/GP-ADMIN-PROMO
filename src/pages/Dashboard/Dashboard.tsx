// src/pages/Dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MetricCard from '../../components/dashboard/MetricCard/MetricCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed/ActivityFeed';
import RecentActivityPanel from '../../components/dashboard/RecentActivityPanel/RecentActivityPanel';
import SystemStatusPanel from '../../components/dashboard/SystemStatusPanel/SystemStatusPanel';
import QuickActionsPanel from '../../components/dashboard/QuickActionsPanel/QuickActionsPanel';
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
  const { token, user } = useAuth();
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

  // Check if user can execute draws
  const canExecuteDraws = user?.role === 'SUPER_ADMIN';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">MTN Mega Billion Dashboard</h1>
        <div className="dashboard-date">
          <span>{new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      
      {error && (
        <div className="error-alert">
          <span>{error}</span>
        </div>
      )}
      
      <div className="metrics-grid">
        <MetricCard 
          title="Total Draws" 
          value={metrics?.totalDraws || 0} 
          loading={loading} 
          color="primary"
        />
        <MetricCard 
          title="Active Draws" 
          value={metrics?.activeDraws || 0} 
          loading={loading} 
          color="success"
        />
        <MetricCard 
          title="Total Participants" 
          value={metrics?.totalParticipants || 0} 
          loading={loading} 
          color="info"
        />
        <MetricCard 
          title="Total Winners" 
          value={metrics?.totalWinners || 0} 
          loading={loading} 
          color="accent"
        />
      </div>
      
      <div className="dashboard-panels">
        <div className="panel-column main-column">
          <SystemStatusPanel status={metrics?.systemStatus || 'loading'} loading={loading} />
          <RecentActivityPanel loading={loading} />
        </div>
        <div className="panel-column side-column">
          {canExecuteDraws && <QuickActionsPanel />}
          <ActivityFeed loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
