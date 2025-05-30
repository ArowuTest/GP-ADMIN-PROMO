// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout/AppLayout';

import Dashboard from './pages/Dashboard/Dashboard';
import DrawManagement from './pages/DrawManagement/DrawManagementPage';
import Login from './pages/Login/LoginPage';
import NotFound from './pages/NotFound/NotFoundPage';
import ParticipantManagement from './pages/ParticipantManagement/ParticipantManagementPage';
import PrizeStructure from './pages/PrizeStructure/PrizeStructurePage';
import Reports from './pages/Reports/ReportsPage';
import UserManagement from './pages/UserManagement/UserManagementPage';
import './App.css';

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return isAuthenticated ? <>{element}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute element={<AppLayout />} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="draw-management" element={<DrawManagement />} />
            <Route path="participant-management" element={<ParticipantManagement />} />
            <Route path="prize-structure" element={<PrizeStructure />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
