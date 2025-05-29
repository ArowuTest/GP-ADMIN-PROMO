// src/components/dashboard/QuickActionsPanel.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuickActionButton from './QuickActionButton';
import './QuickActionsPanel.css';

const QuickActionsPanel: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="quick-actions-panel">
      <h3 className="panel-title">Quick Actions</h3>
      <div className="quick-actions-grid">
        <QuickActionButton 
          icon="casino"
          label="New Draw"
          onClick={() => navigate('/draw-management')}
        />
        <QuickActionButton 
          icon="people"
          label="Upload Participants"
          onClick={() => navigate('/participant-management')}
        />
        <QuickActionButton 
          icon="emoji_events"
          label="Prize Structure"
          onClick={() => navigate('/prize-structure')}
        />
        <QuickActionButton 
          icon="assessment"
          label="View Reports"
          onClick={() => navigate('/reports')}
        />
      </div>
    </div>
  );
};

export default QuickActionsPanel;
