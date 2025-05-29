// src/components/layout/Header/Header.tsx
import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="logo-container">
        <h1>MTN Mega Billion Promo</h1>
        <span className="subtitle">Admin Portal</span>
      </div>
      
      <div className="header-actions">
        {user && (
          <>
            <div className="user-info">
              <span className="user-name">{user.fullName || user.username}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
