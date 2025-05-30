// src/components/dashboard/MetricCard/MetricCard.tsx
import React from 'react';
import './MetricCard.css';

interface MetricCardProps {
  title: string;
  value: number;
  loading?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  loading = false,
  color = 'primary'
}) => {
  return (
    <div className={`metric-card ${color}`}>
      <div className="metric-card-content">
        <h3 className="metric-title">{title}</h3>
        {loading ? (
          <div className="metric-loading">Loading...</div>
        ) : (
          <div className="metric-value">{value.toLocaleString()}</div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
