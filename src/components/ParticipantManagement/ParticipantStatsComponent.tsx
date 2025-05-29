// src/components/ParticipantManagement/ParticipantStatsComponent.tsx
import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { UserOutlined, BarChartOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useApi } from '../../hooks/useApi';
import { ParticipantStatsResponse } from '../../types/api';
import './ParticipantStatsComponent.css';

/**
 * Component for displaying participant statistics
 */
const ParticipantStatsComponent: React.FC = () => {
  // Fetch participant statistics
  const {
    data: stats,
    loading,
    error,
    execute: fetchStats
  } = useApi<ParticipantStatsResponse>(
    async () => {
      const response = await fetch('/admin/participants/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch participant statistics');
      }
      return response.json();
    },
    [],
    true
  );
  
  // Refresh stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  if (loading) {
    return (
      <div className="participant-stats-loading">
        <Spin size="large" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="participant-stats-card participant-stats-error">
        <div className="participant-stats-error-content">
          <p>Failed to load participant statistics.</p>
          <p>{error.message}</p>
        </div>
      </Card>
    );
  }
  
  if (!stats) {
    return (
      <Card className="participant-stats-card participant-stats-empty">
        <div className="participant-stats-empty-content">
          <p>No participant statistics available.</p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="participant-stats-container">
      <Card title="Participant Statistics" className="participant-stats-card">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Participants"
              value={stats.totalParticipants}
              prefix={<UserOutlined />}
              className="participant-statistic"
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Points"
              value={stats.totalPoints}
              prefix={<BarChartOutlined />}
              className="participant-statistic"
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Average Points"
              value={stats.averagePoints}
              precision={2}
              prefix={<CalculatorOutlined />}
              className="participant-statistic"
            />
          </Col>
        </Row>
        
        <div className="participant-stats-info">
          <p>
            Each participant is entered into the draw based on their points.
            <br />
            A participant with N points will have N entries in the draw.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ParticipantStatsComponent;
