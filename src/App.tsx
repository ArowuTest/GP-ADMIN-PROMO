// src/App.tsx
import type { JSX } from 'react'; // Explicitly import JSX type if needed by verbatimModuleSyntax
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage"; 
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DrawManagementPage from "./pages/DrawManagementPage"; 
// Removed: import PrizeStructuresPage from "./pages/PrizeStructuresPage"; 
// Removed: import UserManagementPage from "./pages/UserManagementPage"; 
import AuditLogsPage from "./pages/AuditLogsPage"; 
import AdminLayout from "./components/layout/AdminLayout"; 
import { AuthProvider, useAuth } from "./contexts/AuthContext"; 

// Import the functional components
import PrizeStructureListComponent from "./components/PrizeManagement/PrizeStructureListComponent";
import UserListComponent from "./components/UserManagement/UserListComponent";

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
        {/* Updated routes to functional components */}
        <Route path="prize-structures" element={<PrizeStructureListComponent />} />
        <Route path="user-management" element={<UserListComponent />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        {/* Add more admin routes here as needed */}
      </Route>
      {/* Redirect any other path to login or a specific admin page if authenticated */}
      <Route path="*" element={<Navigate to="/login" replace />} /> 
    </Routes>
  );
}

// Main App component that includes the AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;



