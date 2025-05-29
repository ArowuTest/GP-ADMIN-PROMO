// src/components/UserManagement/UserForm.tsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Switch } from 'antd';
import { UserResponse, UserCreateRequest, UserUpdateRequest } from '../../types/api';
import { UUID, UserRole } from '../../types/common';
import './UserForm.css';

interface UserFormProps {
  initialValues?: UserResponse;
  onSubmit: (values: UserCreateRequest | UserUpdateRequest) => Promise<void>;
  loading: boolean;
}

/**
 * Component for creating or editing users
 */
const UserForm: React.FC<UserFormProps> = ({
  initialValues,
  onSubmit,
  loading
}) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState<boolean>(!!initialValues);
  
  // Set initial form values when editing
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        username: initialValues.username,
        email: initialValues.email,
        fullName: initialValues.fullName,
        role: initialValues.role,
        isActive: initialValues.isActive
      });
    }
  }, [initialValues, form]);
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
      
      if (!isEditing) {
        form.resetFields();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };
  
  return (
    <div className="user-form-container">
      <Card 
        title={isEditing ? "Edit User" : "Create User"} 
        className="user-form-card"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            role: UserRole.ADMIN
          }}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter a username' }]}
          >
            <Input placeholder="Enter username" disabled={isEditing} />
          </Form.Item>
          
          {!isEditing && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: !isEditing, message: 'Please enter a password' }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter an email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select role">
              <Select.Option value={UserRole.SUPER_ADMIN}>Super Admin</Select.Option>
              <Select.Option value={UserRole.ADMIN}>Admin</Select.Option>
              <Select.Option value={UserRole.SENIOR_USER}>Senior User</Select.Option>
              <Select.Option value={UserRole.WINNERS_REPORT_USER}>Winners Report User</Select.Option>
              <Select.Option value={UserRole.ALL_REPORT_USER}>All Report User</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item className="form-actions">
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
            <Button 
              htmlType="button" 
              onClick={() => form.resetFields()}
              disabled={loading}
            >
              Reset
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserForm;
