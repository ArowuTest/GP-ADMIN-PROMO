import React from "react"; // Removed useState, useEffect as they are not used here
import { Link, useNavigate, Outlet } from "react-router-dom"; // Import Outlet
import { useAuth, type UserRole } from "../../contexts/AuthContext";

// Define navigation items with required roles
interface NavItem {
  path: string;
  label: string;
  allowedRoles: UserRole[];
}

const navItems: NavItem[] = [
  { path: "/admin/dashboard", label: "Dashboard", allowedRoles: ["SUPER_ADMIN", "ADMIN", "SENIOR_USER", "WINNER_REPORTS_USER", "ALL_REPORT_USER"] },
  { path: "/admin/draw-management", label: "Draw Management", allowedRoles: ["SUPER_ADMIN", "ADMIN", "SENIOR_USER"] },
  { path: "/admin/prize-structures", label: "Prize Structures", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/admin/user-management", label: "User Management", allowedRoles: ["SUPER_ADMIN"] },
  { path: "/admin/participant-upload", label: "Participant Upload", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/admin/winners-report", label: "Winners Report", allowedRoles: ["SUPER_ADMIN", "ADMIN", "SENIOR_USER", "WINNER_REPORTS_USER", "ALL_REPORT_USER"] }, // Added Winners Report
  { path: "/admin/audit-logs", label: "Audit Logs", allowedRoles: ["SUPER_ADMIN", "ADMIN", "ALL_REPORT_USER"] },
];

const Sidebar: React.FC = () => {
  const { userRole, logout, username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside style={{ width: "250px", borderRight: "1px solid #ccc", padding: "20px", display: "flex", flexDirection: "column", background: "#f8f9fa" }}>
      <h2 style={{fontSize: "1.5em", marginBottom: "20px"}}>Admin Menu</h2>
      <nav style={{ flexGrow: 1 }}>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {navItems.map(item => {
            if (userRole && item.allowedRoles.includes(userRole as UserRole)) {
              return (
                <li key={item.path} style={{ marginBottom: "10px" }}>
                  <Link to={item.path} style={{ textDecoration: "none", color: "#007bff", fontSize: "1.1em" }}>{item.label}</Link>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </nav>
      <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #eee" }}>
        {username && <p style={{margin: "0 0 5px 0"}}>User: {username}</p>}
        {userRole && <p style={{margin: "0 0 10px 0"}}>Role: {userRole}</p>}
        <button 
          onClick={handleLogout} 
          style={{
            width: "100%", 
            padding: "10px", 
            marginTop: "10px", 
            backgroundColor: "#dc3545", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

const Header: React.FC = () => {
  return (
    <header style={{ padding: "20px", borderBottom: "1px solid #ccc", backgroundColor: "#343a40", color: "white" }}>
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
        <main style={{ flexGrow: 1, padding: "20px", backgroundColor: "#fff" }}>
          <Outlet /> {/* Use Outlet here to render child routes */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
