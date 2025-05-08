import React from 'react';
import { Outlet, Link } from 'react-router-dom';

// Placeholder for a proper Sidebar and Header component
const Sidebar: React.FC = () => {
  return (
    <aside style={{ width: '250px', borderRight: '1px solid #ccc', padding: '20px' }}>
      <h2>Admin Menu</h2>
      <nav>
        <ul>
          <li><Link to="/admin/dashboard">Dashboard</Link></li>
          <li><Link to="/admin/draw-management">Draw Management</Link></li>
          <li><Link to="/admin/prize-structures">Prize Structures</Link></li>
          <li><Link to="/admin/user-management">User Management</Link></li>
          <li><Link to="/admin/audit-logs">Audit Logs</Link></li>
          <li><Link to="/login">Logout</Link></li> {/* Simple logout link for now */} 
        </ul>
      </nav>
    </aside>
  );
};

const Header: React.FC = () => {
  return (
    <header style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
      <h1>Mynumba Don Win - Admin Portal</h1>
    </header>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header />
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: '20px' }}>
          <Outlet /> {/* This is where nested route components will render */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

