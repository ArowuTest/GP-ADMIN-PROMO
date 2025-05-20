// src/App.tsx
import type { JSX } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage"; 
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DrawManagementPage from "./pages/DrawManagementPage"; 
import AuditLogsPage from "./pages/AuditLogsPage"; 
import AdminLayout from "./components/layout/AdminLayout"; 
import { AuthProvider, useAuth } from "./contexts/AuthContext"; 

import PrizeStructureListComponent from "./components/PrizeManagement/PrizeStructureListComponent";
import UserListComponent from "./components/UserManagement/UserListComponent";
import ParticipantUploadComponent from "./components/ParticipantManagement/ParticipantUploadComponent";
import WinnersReportPage from "./components/Reports/WinnersReportPage"; // Import the Winners Report Page

// ProtectedRoute component using AuthContext
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useAuth();

  if (auth.isLoadingAuth) {
    return <p>Loading authentication...</p>; 
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
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
        <Route path="prize-structures" element={<PrizeStructureListComponent />} />
        <Route path="user-management" element={<UserListComponent />} />
        <Route path="participant-upload" element={<ParticipantUploadComponent />} />
        <Route path="winners-report" element={<WinnersReportPage />} /> {/* Add Winners Report route */}
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} /> 
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
