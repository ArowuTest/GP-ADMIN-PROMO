// src/pages/NotFound/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">
          <span className="material-icons">error_outline</span>
        </div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard" className="back-button">
          <span className="material-icons">arrow_back</span>
          Back to MTN Mega Billion Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
