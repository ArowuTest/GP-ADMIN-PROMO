// src/components/dashboard/QuickActionButton.tsx
import React from 'react';
import './QuickActionButton.css';

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false
}) => {
  return (
    <button 
      className="quick-action-button" 
      onClick={onClick}
      disabled={disabled}
    >
      <span className="material-icons">{icon}</span>
      <span className="quick-action-label">{label}</span>
    </button>
  );
};

export default QuickActionButton;
