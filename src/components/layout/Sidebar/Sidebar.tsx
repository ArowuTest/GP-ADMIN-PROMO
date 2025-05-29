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
      icon: 'dashboard',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SENIOR_USER, UserRole.WINNERS_REPORT_USER, UserRole.ALL_REPORT_USER] 
    },
    { 
      path: '/draw-management', 
      label: 'Draw Management', 
      icon: 'casino',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] 
    },
    { 
      path: '/participant-management', 
      label: 'Participant Management', 
      icon: 'people',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SENIOR_USER] 
    },
    { 
      path: '/prize-structure', 
      label: 'Prize Structure', 
      icon: 'emoji_events',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SENIOR_USER] 
    },
    { 
      path: '/user-management', 
      label: 'User Management', 
      icon: 'manage_accounts',
      roles: [UserRole.SUPER_ADMIN] 
    },
    { 
      path: '/reports', 
      label: 'Reports', 
      icon: 'assessment',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SENIOR_USER, UserRole.WINNERS_REPORT_USER, UserRole.ALL_REPORT_USER] 
    }
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(role as UserRole) || role === UserRole.SUPER_ADMIN
  );

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        <ul>
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <span className="material-icons">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
