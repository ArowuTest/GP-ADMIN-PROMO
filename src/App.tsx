// src/App.tsx
import React from 'react';
import type { JSX } from 'react'; // Explicitly import JSX type if needed by verbatimModuleSyntax
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage"; 
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DrawManagementPage from "./pages/DrawManagementPage"; 
import PrizeStructuresPage from "./pages/PrizeStructuresPage"; 
import UserManagementPage from "./pages/UserManagementPage"; 
import AuditLogsPage from "./pages/AuditLogsPage"; 
import AdminLayout from "./components/layout/AdminLayout"; 
import { AuthProvider, useAuth } from "./contexts/AuthContext"; 

// ProtectedRoute component using AuthContext
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() { // Renamed to avoid conflict with App component if any
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/admin"
        element={ 
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="draw-management" element={<DrawManagementPage />} />
        <Route path="prize-structures" element={<PrizeStructuresPage />} />
        <Route path="user-management" element={<UserManagementPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        {/* Add more admin routes here as needed */}
      </Route>
      {/* Redirect any other path to login or a specific admin page if authenticated */}
      <Route path="*" element={<Navigate to="/login" replace />} /> 
    </Routes>
  );
}

// Main App component that includes the AuthProvider and BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

