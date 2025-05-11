// src/components/layout/AdminLayout.tsx
import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "../../contexts/AuthContext"; // Adjusted path

// Define navigation items with required roles
interface NavItem {
  path: string;
  label: string;
  allowedRoles: UserRole[];
}

const navItems: NavItem[] = [
  { path: "/admin/dashboard", label: "Dashboard", allowedRoles: ["SuperAdmin", "Admin", "SeniorUser", "WinnerReportsUser", "AllReportUser"] },
  { path: "/admin/draw-management", label: "Draw Management", allowedRoles: ["SuperAdmin", "Admin", "SeniorUser"] }, // SuperAdmin executes, Admin/SeniorUser might view/prep
  { path: "/admin/prize-structures", label: "Prize Structures", allowedRoles: ["SuperAdmin", "Admin"] },
  { path: "/admin/user-management", label: "User Management", allowedRoles: ["SuperAdmin"] },
  { path: "/admin/audit-logs", label: "Audit Logs", allowedRoles: ["SuperAdmin", "Admin", "AllReportUser"] }, // Assuming AllReportUser can see audit logs too
  // Add other navigation items like specific report pages if needed
];

const Sidebar: React.FC = () => {
  const { userRole, logout, username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside style={{ width: "250px", borderRight: "1px solid #ccc", padding: "20px", display: "flex", flexDirection: "column" }}>
      <h2>Admin Menu</h2>
      <nav style={{ flexGrow: 1 }}>
        <ul>
          {navItems.map(item => {
            if (userRole && item.allowedRoles.includes(userRole)) {
              return (
                <li key={item.path}>
                  <Link to={item.path}>{item.label}</Link>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </nav>
      <div style={{ marginTop: "auto" }}>
        {username && <p>User: {username}</p>}
        {userRole && <p>Role: {userRole}</p>}
        <button onClick={handleLogout} style={{ width: "100%", padding: "10px", marginTop: "10px" }}>Logout</button>
      </div>
    </aside>
  );
};

const Header: React.FC = () => {
  return (
    <header style={{ padding: "20px", borderBottom: "1px solid #ccc" }}>
      <h1>Mynumba Don Win - Admin Portal</h1>
    </header>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <Header />
      <div style={{ display: "flex", flexGrow: 1 }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: "20px" }}>
          <Outlet /> {/* This is where nested route components will render */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

