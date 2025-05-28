// src/pages/LoginPage.tsx - Updated login page with React Router navigation
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Debug flag
const DEBUG = true;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (DEBUG) {
      console.log('[LOGIN_PAGE] Login form submitted', { email, hasPassword: !!password });
    }
    
    setError(null);
    setLoading(true);
    
    try {
      if (DEBUG) {
        console.log('[LOGIN_PAGE] Calling login function');
      }
      
      const response = await login(email, password);
      
      if (DEBUG) {
        console.log('[LOGIN_PAGE] Login response received:', { 
          success: response.success,
          hasError: !!response.error
        });
      }
      
      if (response.success) {
        if (DEBUG) {
          console.log('[LOGIN_PAGE] Login successful, navigating to:', from);
        }
        
        // Use React Router's navigate instead of window.location
        navigate(from, { replace: true });
      } else {
        setError(response.error || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('[LOGIN_PAGE] Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
