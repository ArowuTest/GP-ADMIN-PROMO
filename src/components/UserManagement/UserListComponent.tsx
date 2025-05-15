// src/components/UserManagement/UserListComponent.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import UserForm, { type UserFormData } from "./UserForm";
// Corrected import path to remove .ts extension
import { userService, type UserData } from "../../services/userService"; 

// The User interface should now align with UserData from the service
export type User = UserData;

const UserListComponent: React.FC = () => {
  const { token, userRole: currentUserRole } = useAuth(); 
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManageUsers = currentUserRole === "SUPER_ADMIN";

  const fetchUsers = useCallback(async () => {
    if (!canManageUsers || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedUsers = await userService.listUsers(token);
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to fetch users.");
    }
    setIsLoading(false);
  }, [canManageUsers, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddNewUser = () => {
    if (!canManageUsers) return;
    setEditingUser(null);
    setShowForm(true);
    setError(null);
  };

  const handleEditUser = (user: User) => {
    if (!canManageUsers) return;
    if (user.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN") {
      setError("Only a SUPER_ADMIN can edit another SUPER_ADMIN user.");
      return;
    }
    setEditingUser({
      id: String(user.id), 
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.status === "Active", 
    });
    setShowForm(true);
    setError(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!canManageUsers || !token) return;
    const userToDelete = users.find(u => String(u.id) === userId); 
    if (userToDelete && userToDelete.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN") {
      setError("Only a SUPER_ADMIN can delete another SUPER_ADMIN user.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete user ${userToDelete?.username}?`)) {
      setIsLoading(true);
      try {
        await userService.deleteUser(userId, token); 
        await fetchUsers(); 
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || "Failed to delete user.");
      }
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    if (!canManageUsers || !token) return;

    if (user.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN") {
        setError("Only a SUPER_ADMIN can change the status of another SUPER_ADMIN user.");
        return;
    }

    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    setIsLoading(true);
    try {
      await userService.updateUser(String(user.id), { status: newStatus }, token);
      await fetchUsers(); 
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to update user status.");
    }
    setIsLoading(false);
  };

  const handleSaveUser = async (formData: UserFormData) => {
    if (!canManageUsers || !token) return;
    setError(null);
    setIsLoading(true);

    const payload = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.isActive ? "Active" : ("Inactive" as "Active" | "Inactive" | "Locked"),
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
    };

    try {
      if (formData.id) { 
        await userService.updateUser(formData.id as string, payload, token); 
      } else { 
        if (!payload.password) {
            setError("Password is required for new users.");
            setIsLoading(false);
            return;
        }
        await userService.createUser(payload as any, token); 
      }
      await fetchUsers(); 
      setShowForm(false);
      setEditingUser(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || (formData.id ? "Failed to update user." : "Failed to create user."));
    }
    setIsLoading(false);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setError(null);
  };

  const styles = {
    container: { padding: "20px", fontFamily: "Arial, sans-serif" },
    button: { padding: "8px 15px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "5px", marginBottom: "15px" },
    actionButton: { padding: "5px 10px", fontSize: "12px", marginRight: "5px"},
    statusButton: { padding: "5px 10px", fontSize: "12px", marginRight: "5px", width: "85px" },
    table: { width: "100%", borderCollapse: "collapse" as "collapse", marginTop: "15px" },
    th: { border: "1px solid #ddd", padding: "10px", backgroundColor: "#f2f2f2", textAlign: "left" as "left" },
    td: { border: "1px solid #ddd", padding: "10px" },
    error: { color: "red", marginBottom: "10px", backgroundColor: "#ffebee", border: "1px solid #e57373", padding: "10px", borderRadius: "4px" },
    permissionDenied: { color: "orange", padding: "10px", border: "1px solid orange", borderRadius: "4px", backgroundColor: "#fff3e0"}
  };

  if (!canManageUsers && currentUserRole !== null) { 
    return <div style={styles.container}><p style={styles.permissionDenied}>You do not have permission to manage users. (Requires SUPER_ADMIN role)</p></div>;
  }
  if (currentUserRole === null && !token) { 
    return <div style={styles.container}><p>Loading authentication details...</p></div>;
  }

  if (showForm) {
    return (
      <div style={styles.container}>
        <UserForm user={editingUser} onSave={handleSaveUser} onCancel={handleCancelForm} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>User Management</h2>
      {error && <p style={styles.error}>{error}</p>}
      {isLoading && <p>Loading users...</p>}
      {!isLoading && canManageUsers && <button onClick={handleAddNewUser} style={styles.button}>Add New User</button>}
      {!isLoading && users.length === 0 && !error && <p>No users found.</p>}
      {!isLoading && users.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={String(user.id)}>
                <td style={styles.td}>{String(user.id).substring(0,8)}...</td> 
                <td style={styles.td}>{user.username}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.role}</td>
                <td style={styles.td}>{user.status}</td>
                <td style={styles.td}>
                  <button onClick={() => handleEditUser(user)} style={{...styles.button, ...styles.actionButton}}
                          disabled={user.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN"}>
                    Edit
                  </button>
                  <button onClick={() => handleToggleUserStatus(user)}
                          style={{
                              ...styles.button,
                              ...styles.statusButton,
                              backgroundColor: user.status === "Active" ? "#ffc107" : "#28a745"
                          }}
                          disabled={(user.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN")}>
                    {user.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => handleDeleteUser(String(user.id))} style={{...styles.button, ...styles.actionButton, backgroundColor: "#dc3545"}}
                          disabled={(user.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN")}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserListComponent;

