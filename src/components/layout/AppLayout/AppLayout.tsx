// src/components/layout/AppLayout/AppLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import './AppLayout.css';

const AppLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <Header />
      <div className="app-container">
        <Sidebar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
