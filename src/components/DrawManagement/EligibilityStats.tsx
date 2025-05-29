// src/components/DrawManagement/EligibilityStats.tsx
import React from 'react';
import { Card, Statistic, Row, Col, Spin } from 'antd';
import { UserOutlined, BarChartOutlined } from '@ant-design/icons';
import { EligibilityStatsResponse } from '../../types/api';
import './EligibilityStats.css';

interface EligibilityStatsProps {
  stats: EligibilityStatsResponse | null;
  loading: boolean;
  date?: string;
}

/**
 * Component to display eligibility statistics for a draw date
 */
const EligibilityStats: React.FC<EligibilityStatsProps> = ({
  stats,
  loading,
  date
}) => {
  if (loading) {
    return (
      <div className="eligibility-stats-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="eligibility-stats-card eligibility-stats-empty">
        <div className="eligibility-stats-empty-content">
          <p>No eligibility data available{date ? ` for ${date}` : ''}.</p>
          <p>Please select a valid date to view eligibility statistics.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Eligibility Statistics" 
      className="eligibility-stats-card"
      extra={date ? <span className="eligibility-stats-date">{date}</span> : null}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Statistic
            title="Eligible Participants"
            value={stats.totalEligible}
            prefix={<UserOutlined />}
            className="eligibility-stats-statistic"
          />
        </Col>
        <Col xs={24} sm={12}>
          <Statistic
            title="Total Entries"
            value={stats.totalEntries}
            prefix={<BarChartOutlined />}
            className="eligibility-stats-statistic"
          />
        </Col>
      </Row>
      <div className="eligibility-stats-info">
        <p>
          Each eligible MSISDN is entered into the draw based on their points.
          <br />
          Average entries per participant: {stats.totalEligible > 0 
            ? (stats.totalEntries / stats.totalEligible).toFixed(2) 
            : '0'}
        </p>
      </div>
    </Card>
  );
};

export default EligibilityStats;
