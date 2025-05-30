// src/components/dashboard/MetricCard/MetricCard.tsx
import React from 'react';
import './MetricCard.css';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: string;
  loading?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  loading = false,
  color = 'primary'
}) => {
  // Format large numbers with commas
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  
  return (
    <div className={`metric-card metric-card-${color}`}>
      <div className="metric-card-content">
        <h3 className="metric-card-title">{title}</h3>
        {loading ? (
          <div className="metric-card-loading">
            <div className="loading-pulse"></div>
          </div>
        ) : (
          <p className="metric-card-value">{formattedValue}</p>
        )}
      </div>
      <div className="metric-card-icon">
        <span className="material-icons">{icon}</span>
      </div>
    </div>
  );
};

export default MetricCard;
