// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Debug flag to enable detailed logging
const DEBUG = true;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // CRITICAL FIX: Check authentication state on component mount
  useEffect(() => {
    if (DEBUG) {
      console.log('[LOGIN_PAGE] Component mounted, checking auth state:', { isAuthenticated });
    }
    
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      if (DEBUG) {
        console.log('[LOGIN_PAGE] Already authenticated, redirecting to dashboard');
      }
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    // CRITICAL FIX: Add more explicit preventDefault to ensure form doesn't submit normally
    e.preventDefault();
    
    if (DEBUG) {
      console.log('[LOGIN_PAGE] Login form submitted', { email, hasPassword: !!password });
    }
    
    setError(null);
    setLoading(true);
    
    try {
      // CRITICAL FIX: Add more detailed logging
      if (DEBUG) {
        console.log('[LOGIN_PAGE] Calling login function');
      }
      
      // Call login with both email and password parameters
      const response = await login(email, password);
      
      if (DEBUG) {
        console.log('[LOGIN_PAGE] Login response received:', { 
          success: response.success,
          hasError: !!response.error
        });
      }
      
      if (response.success) {
        // CRITICAL FIX: Add explicit navigation with timeout
        if (DEBUG) {
          console.log('[LOGIN_PAGE] Login successful, navigating to dashboard');
        }
        
        // Use timeout to ensure state updates before navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
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

  // CRITICAL FIX: Add explicit button click handler as backup
  const handleLoginClick = () => {
    if (DEBUG) {
      console.log('[LOGIN_PAGE] Login button clicked directly');
    }
    
    // Manually trigger form submission
    const form = document.querySelector('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        
        {/* CRITICAL FIX: Add noValidate to prevent browser validation */}
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
          
          {/* CRITICAL FIX: Add explicit onClick handler as backup */}
          <button 
            type="submit" 
            disabled={loading}
            onClick={handleLoginClick}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
