// src/components/layout/Sidebar/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types/common';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || '';
  
  // Define navigation items with role-based access control
  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SENIOR_USER, UserRole.WINNERS_REPORT_USER, UserRole.ALL_REPORT_USER] 
    },
    { 
      path: '/draw-management', 
      label: 'Draw Management', 
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] 
    },
    { 
      path: '/participant-management', 
      label: 'Participant Management', 
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SENIOR_USER] 
    },
    { 
      path: '/prize-structure', 
      label: 'Prize Structure', 
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SENIOR_USER] 
    },
    { 
      path: '/user-management', 
      label: 'User Management', 
      roles: [UserRole.SUPER_ADMIN] 
    },
    { 
      path: '/reports', 
      label: 'Reports', 
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SENIOR_USER, UserRole.WINNERS_REPORT_USER, UserRole.ALL_REPORT_USER] 
    }
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(role as UserRole) || role === UserRole.SUPER_ADMIN
  );

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <h3>MTN Mega Billion</h3>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>MTN Mega Billion Promo</p>
        <small>© {new Date().getFullYear()} MTN Nigeria</small>
      </div>
    </aside>
  );
};

export default Sidebar;
