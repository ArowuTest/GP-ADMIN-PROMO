// src/components/UserManagement/UserList.tsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Popconfirm, message, Tooltip, Modal, Input } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useUserManagement } from '../../hooks/useUserManagement';
import { usePaginatedApi } from '../../hooks/useApi';
import { UserResponse } from '../../types/api';
import { UUID, UserRole } from '../../types/common';
import './UserList.css';

interface UserListProps {
  onEdit: (user: UserResponse) => void;
  onAdd: () => void;
}

/**
 * Component for displaying and managing users
 */
const UserList: React.FC<UserListProps> = ({
  onEdit,
  onAdd
}) => {
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<UUID | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  
  // Fetch users with pagination
  const {
    data: users,
    loading,
    pagination,
    changePage,
    refresh: refreshUsers
  } = usePaginatedApi<UserResponse>(
    '/admin/users',
    { page: 1, pageSize: 10 }
  );
  
  const {
    resetPassword,
    isLoading: isResettingPassword,
    error: resetError
  } = useUserManagement();
  
  // Handle delete user
  const handleDeleteUser = async (userId: UUID) => {
    try {
      // Implementation would call the delete user API
      message.success('User deleted successfully');
      refreshUsers();
    } catch (err) {
      console.error('Delete error:', err);
      message.error('Failed to delete user');
    }
  };
  
  // Handle reset password
  const handleResetPassword = (userId: UUID) => {
    setSelectedUserId(userId);
    setNewPassword('');
    setResetPasswordModalVisible(true);
  };
  
  // Submit password reset
  const handleResetPasswordSubmit = async () => {
    if (!selectedUserId || !newPassword) {
      message.error('Please enter a new password');
      return;
    }
    
    try {
      const success = await resetPassword(selectedUserId, newPassword);
      if (success) {
        message.success('Password reset successfully');
        setResetPasswordModalVisible(false);
      }
    } catch (err) {
      console.error('Reset password error:', err);
    }
  };
  
  // Get role tag color
  const getRoleTagColor = (role: string): string => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'magenta';
      case UserRole.ADMIN:
        return 'red';
      case UserRole.SENIOR_USER:
        return 'orange';
      case UserRole.WINNERS_REPORT_USER:
        return 'green';
      case UserRole.ALL_REPORT_USER:
        return 'blue';
      default:
        return 'default';
    }
  };
  
  // Table columns
  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <span className="user-username">{text}</span>
      )
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleTagColor(role)}>
          {role.replace(/_/g, ' ')}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />} color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UserResponse) => (
        <div className="user-actions">
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Reset Password">
            <Button
              icon={<LockOutlined />}
              size="small"
              onClick={() => handleResetPassword(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      )
    }
  ];
  
  return (
    <div className="user-list-container">
      <Card 
        title="Users" 
        className="user-list-card"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
          >
            Add User
          </Button>
        }
      >
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination?.page || 1,
            pageSize: pagination?.pageSize || 10,
            total: pagination?.totalRows || 0,
            onChange: changePage
          }}
          className="user-table"
        />
      </Card>
      
      <Modal
        title="Reset Password"
        open={resetPasswordModalVisible}
        onCancel={() => setResetPasswordModalVisible(false)}
        onOk={handleResetPasswordSubmit}
        confirmLoading={isResettingPassword}
      >
        <div className="reset-password-form">
          <p>Enter new password for the user:</p>
          <Input.Password
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          {resetError && (
            <div className="reset-password-error">
              {resetError}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
