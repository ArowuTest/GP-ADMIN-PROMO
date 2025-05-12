// src/components/UserManagement/UserForm.tsx
import React, { useState, useEffect } from "react";
import { useAuth, type UserRole } from "../../contexts/AuthContext";

export interface UserFormData {
  id?: number | string;
  username: string;
  email: string; 
  password?: string; 
  role: UserRole; 
  isActive: boolean; 
}

interface UserFormProps {
  user?: UserFormData | null; 
  onSave: (userData: UserFormData) => void;
  onCancel: () => void;
}

const availableRoles: Exclude<UserRole, null>[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "SENIOR_USER",
  "WINNER_REPORTS_USER",
  "ALL_REPORT_USER",
];

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const { userRole: currentUserRole } = useAuth();
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    role: "WINNER_REPORTS_USER", 
    isActive: true, 
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        password: "", 
      });
    } else {
      setFormData({
        username: "",
        email: "",
        role: "WINNER_REPORTS_USER",
        isActive: true,
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "role") {
      const newRole = value === "" ? null : value as Exclude<UserRole, null>;
      setFormData(prev => ({ ...prev, role: newRole }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError("Please enter a valid email address.");
        return;
    }
    if (!isEditing && !formData.password) {
      setError("Password is required for new users.");
      return;
    }
    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (formData.role === null) {
      setError("Role is required. Please select a role.");
      return;
    }
    if (formData.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN") {
        setError("Only a SUPER_ADMIN can assign the SUPER_ADMIN role.");
        return;
    }
    if (isEditing && user?.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN" && formData.role !== "SUPER_ADMIN") {
        setError("Only a SUPER_ADMIN can change the role of another SUPER_ADMIN.");
        return;
    }
    if (isEditing && user?.id === 1 && user?.username === "superadmin" && !formData.isActive) {
        setError("The primary superadmin cannot be deactivated.");
        return;
    }

    onSave(formData);
  };

  const styles = {
    form: { padding: "20px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" },
    label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
    input: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" as "border-box" },
    checkboxLabel: { display: "flex", alignItems: "center", marginBottom: "15px" },
    checkbox: { marginRight: "10px" },
    select: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" as "border-box" },
    buttonContainer: { marginTop: "20px" },
    button: { padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "10px" },
    cancelButton: { padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
    error: { color: "red", marginBottom: "10px" },
  };

  // Explicitly define the type for selectValue to ensure it's always a string.
  const selectRoleValue: string = formData.role === null ? "" : formData.role;

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>{isEditing ? "Edit User" : "Add New User"}</h2>
      {error && <p style={styles.error}>{error}</p>}
      <div>
        <label htmlFor="username" style={styles.label}>Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          style={styles.input}
          disabled={isEditing && user?.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN"}
        />
      </div>
      <div>
        <label htmlFor="email" style={styles.label}>Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
        />
      </div>
      <div>
        <label htmlFor="password" style={styles.label}>
          Password {isEditing ? "(leave blank to keep current)" : ""}:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password || ""}
          onChange={handleChange}
          style={styles.input}
          placeholder={isEditing ? "New password (min. 6 chars)" : "Min. 6 characters"}
        />
      </div>
      <div>
        <label htmlFor="role" style={styles.label}>Role:</label>
        <select
          id="role"
          name="role"
          value={selectRoleValue} // Use the explicitly typed string variable here
          onChange={handleChange}
          style={styles.select}
          disabled={isEditing && user?.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN"}
        >
          <option value="" disabled={formData.role !== null}>Select a role</option>
          {availableRoles.map(roleValue => (
            <option key={roleValue} value={roleValue} 
                    disabled={roleValue === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN" && (!isEditing || user?.role !== "SUPER_ADMIN")}>
              {roleValue}
            </option>
          ))}
        </select>
      </div>
      <div style={styles.checkboxLabel}>
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          style={styles.checkbox}
          disabled={isEditing && user?.id === 1 && user?.username === "superadmin"} 
        />
        <label htmlFor="isActive">Active User</label>
      </div>
      <div style={styles.buttonContainer}>
        <button type="submit" style={styles.button}>{isEditing ? "Save Changes" : "Add User"}</button>
        <button type="button" onClick={onCancel} style={styles.cancelButton}>Cancel</button>
      </div>
    </form>
  );
};

export default UserForm;


