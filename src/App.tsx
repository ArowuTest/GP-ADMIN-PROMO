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
