// src/components/dashboard/QuickActionsPanel/QuickActionButton.tsx
import React from 'react';
import './QuickActionButton.css';

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  color = 'primary'
}) => {
  return (
    <button 
      className={`quick-action-button quick-action-${color}`} 
      onClick={onClick}
      disabled={disabled}
    >
      <span className="material-icons">{icon}</span>
      <span className="quick-action-label">{label}</span>
    </button>
  );
};

export default QuickActionButton;
