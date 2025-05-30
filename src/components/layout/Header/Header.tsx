// src/components/layout/Header/Header.tsx
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <h1>MTN Mega Billion</h1>
          <span className="subtitle">Administration Portal</span>
        </div>
        
        <div className="header-actions">
          {user && (
            <div className="user-profile">
              <div className="user-avatar" onClick={toggleDropdown}>
                <span className="material-icons">account_circle</span>
                <span className="user-name">{user.fullName || user.username}</span>
                <span className="material-icons dropdown-icon">arrow_drop_down</span>
              </div>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.fullName || user.username}</strong>
                    <span className="user-role">{user.role.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <ul className="dropdown-menu">
                    <li>
                      <button className="dropdown-item">
                        <span className="material-icons">person</span>
                        My Profile
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item">
                        <span className="material-icons">settings</span>
                        Settings
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <span className="material-icons">logout</span>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
