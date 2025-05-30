// src/components/dashboard/QuickActionsPanel/QuickActionsPanel.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuickActionButton from './QuickActionButton';
import './QuickActionsPanel.css';

const QuickActionsPanel: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="quick-actions-panel card">
      <div className="card-header">
        <h3>Quick Actions</h3>
      </div>
      
      <div className="card-body">
        <div className="quick-actions-grid">
          <QuickActionButton 
            icon="shuffle"
            label="Execute Draw"
            onClick={() => navigate('/draw-management')}
            color="primary"
          />
          <QuickActionButton 
            icon="people"
            label="Manage Participants"
            onClick={() => navigate('/participant-management')}
            color="success"
          />
          <QuickActionButton 
            icon="emoji_events"
            label="Prize Structure"
            onClick={() => navigate('/prize-structure')}
            color="warning"
          />
          <QuickActionButton 
            icon="assessment"
            label="View Reports"
            onClick={() => navigate('/reports')}
            color="info"
          />
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;
