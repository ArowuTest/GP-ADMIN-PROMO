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
            email: 'superadmin@example.com',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            createdAt: '2023-01-01T00:00:00Z'
          },
          {
            id: '2',
            username: 'admin',
            email: 'admin@example.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            createdAt: '2023-01-02T00:00:00Z'
          },
          {
            id: '3',
            username: 'senioruser',
            email: 'senior@example.com',
            role: 'SENIOR_USER',
            status: 'ACTIVE',
            createdAt: '2023-01-03T00:00:00Z'
          },
          {
            id: '4',
            username: 'reportuser',
            email: 'report@example.com',
            role: 'REPORT_USER',
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
      case 'REPORT_USER':
        return 'role-report-user';
      default:
        return '';
    }
  };

  return (
    <div className="user-management-page">
      <h1>User Management</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {canManageUsers && (
        <div className="action-buttons">
          <button className="create-button">Create New User</button>
        </div>
      )}
      
      <div className="users-panel">
        <h2>Users</h2>
        
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : users.length > 0 ? (
          <table className="users-table">
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
                    <td className="action-buttons">
                      <button className="edit-button">Edit</button>
                      <button className="reset-password-button">Reset Password</button>
                      {user.id !== currentUser?.id && (
                        <button className={`status-toggle-button ${user.status === 'ACTIVE' ? 'deactivate' : 'activate'}`}>
                          {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-users-message">
            <p>No users found.</p>
          </div>
        )}
      </div>
      
      <div className="note-panel">
        <h3>Note</h3>
        <p>
          This page currently displays mock user data for demonstration purposes. 
          In a production environment, this would be connected to the backend API 
          to manage real user accounts.
        </p>
        <p>
          The User Management API endpoints need to be implemented on the backend 
          before this functionality can be fully operational.
        </p>
      </div>
    </div>
  );
};

export default UserManagementPage;
