// src/pages/UserManagement/UserManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './UserManagementPage.css';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const UserManagementPage: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user has permission to manage users (only Super Admin)
  const canManageUsers = currentUser?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // This would be replaced with a real API call in a complete implementation
        // For now, we'll use mock data that matches the expected structure
        // In a real implementation, this would be:
        // const response = await apiClient.get('/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
        // const data = response.data.data;
        
        // Mock data for demonstration
        const mockUsers: User[] = [
          {
            id: '1',
            username: 'superadmin',
            email: 'superadmin@mtn.com',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            createdAt: '2023-01-01T00:00:00Z'
          },
          {
            id: '2',
            username: 'admin',
            email: 'admin@mtn.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            createdAt: '2023-01-02T00:00:00Z'
          },
          {
            id: '3',
            username: 'senioruser',
            email: 'senior@mtn.com',
            role: 'SENIOR_USER',
            status: 'ACTIVE',
            createdAt: '2023-01-03T00:00:00Z'
          },
          {
            id: '4',
            username: 'reportuser',
            email: 'report@mtn.com',
            role: 'WINNERS_REPORT_USER',
            status: 'INACTIVE',
            createdAt: '2023-01-04T00:00:00Z'
          }
        ];
        
        setUsers(mockUsers);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(`Failed to load users: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'role-super-admin';
      case 'ADMIN':
        return 'role-admin';
      case 'SENIOR_USER':
        return 'role-senior-user';
      case 'WINNERS_REPORT_USER':
        return 'role-winners-report-user';
      case 'ALL_REPORT_USER':
        return 'role-all-report-user';
      default:
        return '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">MTN Mega Billion User Management</h1>
        <p className="page-description">Manage user accounts and permissions for the MTN Mega Billion promotion</p>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <span className="material-icons">error</span>
          <span>{error}</span>
        </div>
      )}
      
      <div className="page-content">
        {canManageUsers && (
          <div className="action-bar">
            <button className="btn btn-primary">
              <span className="material-icons">person_add</span>
              Create New User
            </button>
          </div>
        )}
        
        <div className="card">
          <div className="card-header">
            <h2>
              <span className="material-icons">people</span>
              System Users
            </h2>
          </div>
          
          <div className="card-body">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="table-responsive">
                <table className="table users-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      {canManageUsers && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        {canManageUsers && (
                          <td className="action-cell">
                            <button className="btn btn-sm btn-outline-primary">
                              <span className="material-icons">edit</span>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-outline-warning">
                              <span className="material-icons">key</span>
                              Reset Password
                            </button>
                            {user.id !== currentUser?.id && (
                              <button className={`btn btn-sm ${user.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}`}>
                                <span className="material-icons">{user.status === 'ACTIVE' ? 'block' : 'check_circle'}</span>
                                {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <span className="material-icons empty-icon">people</span>
                <p>No users found.</p>
                {canManageUsers && (
                  <p>Click the "Create New User" button to add your first user.</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="card info-card">
          <div className="card-header">
            <h2>
              <span className="material-icons">info</span>
              Implementation Note
            </h2>
          </div>
          <div className="card-body">
            <p>
              This page currently displays mock user data for demonstration purposes. 
              In the production environment, this will be connected to the MTN Mega Billion backend API 
              to manage real user accounts.
            </p>
            <p>
              The User Management API endpoints need to be implemented on the backend 
              before this functionality can be fully operational.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
