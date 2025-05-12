// src/components/UserManagement/UserListComponent.tsx
import React, { useState, useEffect } from "react";
import { useAuth, type UserRole } from "../../contexts/AuthContext";
import UserForm, { type UserFormData } from "./UserForm"; // Import the form component

// Updated User interface to include email and isActive
export interface User {
  id: number | string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

// Updated mock initial data
const initialMockUsers: User[] = [
  { id: 1, username: "superadmin", email: "super@example.com", role: "SUPER_ADMIN", isActive: true },
  { id: 2, username: "admin_user", email: "admin@example.com", role: "ADMIN", isActive: true },
  { id: 3, username: "reporter", email: "reporter@example.com", role: "WINNER_REPORTS_USER", isActive: true },
  { id: 4, username: "senior_user", email: "senior@example.com", role: "SENIOR_USER", isActive: false }, // Example of an inactive user
  { id: 5, username: "all_reports_user", email: "allreports@example.com", role: "ALL_REPORT_USER", isActive: true },
];

const UserListComponent: React.FC = () => {
  const { userRole: currentUserRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManageUsers = currentUserRole === "SUPER_ADMIN";

  useEffect(() => {
    if (!canManageUsers) return;

    setIsLoading(true);
    setTimeout(() => {
      const storedUsers = localStorage.getItem("mockAdminUsers");
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(initialMockUsers);
        localStorage.setItem("mockAdminUsers", JSON.stringify(initialMockUsers));
      }
      setIsLoading(false);
    }, 500);
  }, [canManageUsers]);

  const saveUsersToLocalStorage = (updatedUsers: User[]) => {
    localStorage.setItem("mockAdminUsers", JSON.stringify(updatedUsers));
  };

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
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role, 
        isActive: user.isActive 
    });
    setShowForm(true);
    setError(null);
  };

  const handleDeleteUser = (userId: number | string) => {
    if (!canManageUsers) return;
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && userToDelete.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN"){
        setError("Only a SUPER_ADMIN can delete another SUPER_ADMIN user.");
        return;
    }
    if (userToDelete && userToDelete.id === 1 && userToDelete.username === "superadmin") {
        setError("The primary superadmin (ID: 1) cannot be deleted.");
        return;
    }

    if (window.confirm(`Are you sure you want to delete user ${userToDelete?.username}?`)) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      saveUsersToLocalStorage(updatedUsers);
      setError(null);
    }
  };

  const handleToggleUserStatus = (userId: number | string) => {
    if (!canManageUsers) return;
    const userToToggle = users.find(u => u.id === userId);

    if (userToToggle && userToToggle.id === 1 && userToToggle.username === "superadmin") {
        setError("The primary superadmin's status cannot be changed directly here.");
        return;
    }

    if (userToToggle && userToToggle.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN") {
        setError("Only a SUPER_ADMIN can change the status of another SUPER_ADMIN user.");
        return;
    }

    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    );
    setUsers(updatedUsers);
    saveUsersToLocalStorage(updatedUsers);
    setError(null);
  };

  const handleSaveUser = (userData: UserFormData) => {
    if (!canManageUsers) return;
    setError(null);
    let updatedUsers;
    if (userData.id) { // Editing existing user
      updatedUsers = users.map(u => 
        u.id === userData.id ? { ...u, username: userData.username, email: userData.email, role: userData.role, isActive: userData.isActive } : u
      );
    } else { // Adding new user
      const newUser: User = {
        id: Date.now(), // Simple ID generation for mock data
        username: userData.username,
        email: userData.email,
        role: userData.role as UserRole, // Ensure role is correctly typed
        isActive: userData.isActive,
      };
      updatedUsers = [...users, newUser];
    }
    setUsers(updatedUsers);
    saveUsersToLocalStorage(updatedUsers);
    setShowForm(false);
    setEditingUser(null);
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
    statusButton: { padding: "5px 10px", fontSize: "12px", marginRight: "5px", width: "80px" },
    table: { width: "100%", borderCollapse: "collapse" as "collapse", marginTop: "15px" },
    th: { border: "1px solid #ddd", padding: "10px", backgroundColor: "#f2f2f2", textAlign: "left" as "left" },
    td: { border: "1px solid #ddd", padding: "10px" },
    error: { color: "red", marginBottom: "10px", backgroundColor: "#ffebee", border: "1px solid #e57373", padding: "10px", borderRadius: "4px" },
    permissionDenied: { color: "orange", padding: "10px", border: "1px solid orange", borderRadius: "4px", backgroundColor: "#fff3e0"}
  };

  if (!canManageUsers) {
    return <div style={styles.container}><p style={styles.permissionDenied}>You do not have permission to manage users. (Requires SUPER_ADMIN role)</p></div>;
  }

  if (isLoading) {
    return <div style={styles.container}><p>Loading users...</p></div>;
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
      <button onClick={handleAddNewUser} style={styles.button}>Add New User</button>
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
            <tr key={user.id}>
              <td style={styles.td}>{user.id}</td>
              <td style={styles.td}>{user.username}</td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>{user.role}</td>
              <td style={styles.td}>{user.isActive ? "Active" : "Inactive"}</td>
              <td style={styles.td}>
                <button onClick={() => handleEditUser(user)} style={{...styles.button, ...styles.actionButton}} 
                        disabled={user.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN" && user.id !== 1}>
                  Edit
                </button>
                <button onClick={() => handleToggleUserStatus(user.id)} 
                        style={{
                            ...styles.button, 
                            ...styles.statusButton, 
                            backgroundColor: user.isActive ? "#ffc107" : "#28a745"
                        }}
                        disabled={(user.id === 1 && user.username === "superadmin") || (user.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN")}>
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => handleDeleteUser(user.id)} style={{...styles.button, ...styles.actionButton, backgroundColor: "#dc3545"}} 
                        disabled={(user.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN") || (user.id === 1 && user.username === "superadmin")}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserListComponent;

