// src/App.tsx - Main application with router configuration
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import DrawManagementPage from './pages/DrawManagementPage';
import PrizeStructuresPage from './pages/PrizeStructuresPage';
import AuditLogsPage from './pages/AuditLogsPage';
import './App.css';

// Loading component to show during authentication checks
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

// Protected route component that handles authentication checks
const ProtectedRoute = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  // Show loading screen while checking authentication
  if (isLoadingAuth) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Use React Router's Navigate component instead of window.location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

// Public route component that redirects to dashboard if already authenticated
const PublicRoute = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  // Get the intended destination from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // Show loading screen while checking authentication
  if (isLoadingAuth) {
    return <LoadingScreen />;
  }

  // Redirect to dashboard or intended destination if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Render child routes if not authenticated
  return <Outlet />;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<AdminDashboardPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/draws" element={<DrawManagementPage />} />
          <Route path="/prizes" element={<PrizeStructuresPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
        </Route>

        {/* Default route - redirect to dashboard or login based on auth state */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
