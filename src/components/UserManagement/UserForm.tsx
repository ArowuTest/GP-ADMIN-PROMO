// src/components/UserManagement/UserForm.tsx
import React, { useState, useEffect } from "react";
import { useAuth, type UserRole } from "../../contexts/AuthContext";

// Updated UserFormData to include first_name and last_name
export interface UserFormData {
  id?: string; // Changed to string to match UserData ID (UUID)
  username: string;
  email: string;
  password?: string;
  first_name?: string; // Added
  last_name?: string;  // Added
  role: UserRole; // This can be null if no role is selected, or a string from UserRole
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
    first_name: "",
    last_name: "",
    role: "WINNER_REPORTS_USER", // Default role, ensure it's a valid UserRole string
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
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role, // user.role can be UserRole (string | null)
        isActive: user.isActive,
        password: "", // Password is not pre-filled for editing
      });
    } else {
      // Reset for new user
      setFormData({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        role: "WINNER_REPORTS_USER", // Default role
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
      // Ensure role is always a string from availableRoles, not null from an empty select option if one existed
      setFormData(prev => ({ ...prev, role: value as Exclude<UserRole, null> }));
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
    if (!formData.role) { // This check might be redundant if role is always set from availableRoles
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

    onSave(formData);
  };

  const styles = {
    form: { padding: "20px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9", maxWidth: "500px", margin: "auto" },
    label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
    input: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" as "border-box" },
    checkboxLabel: { display: "flex", alignItems: "center", marginBottom: "15px" },
    checkbox: { marginRight: "10px" },
    select: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" as "border-box" },
    buttonContainer: { marginTop: "20px", display: "flex", justifyContent: "flex-end" },
    button: { padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "10px" },
    cancelButton: { padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
    error: { color: "red", marginBottom: "10px", backgroundColor: "#ffebee", border: "1px solid #e57373", padding: "10px", borderRadius: "4px" },
  };

  // formData.role is UserRole (string | null). Select value expects string.
  // If formData.role can be null, provide a default empty string or ensure it's always a string.
  // Given availableRoles, formData.role should always be one of those strings.
  const selectRoleValue: string = formData.role || ""; 

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>{isEditing ? "Edit User" : "Add New User"}</h2>
      {error && <p style={styles.error}>{error}</p>}
      <div>
        <label htmlFor="username" style={styles.label}>Username:</label>
        <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} style={styles.input}
               disabled={isEditing && user?.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN"} />
      </div>
      <div>
        <label htmlFor="email" style={styles.label}>Email:</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} />
      </div>
      <div>
        <label htmlFor="first_name" style={styles.label}>First Name (Optional):</label>
        <input type="text" id="first_name" name="first_name" value={formData.first_name || ""} onChange={handleChange} style={styles.input} />
      </div>
      <div>
        <label htmlFor="last_name" style={styles.label}>Last Name (Optional):</label>
        <input type="text" id="last_name" name="last_name" value={formData.last_name || ""} onChange={handleChange} style={styles.input} />
      </div>
      <div>
        <label htmlFor="password" style={styles.label}>
          Password {isEditing ? "(leave blank to keep current)" : ""}:
        </label>
        <input type="password" id="password" name="password" value={formData.password || ""} onChange={handleChange} style={styles.input}
               placeholder={isEditing ? "New password (min. 6 chars)" : "Min. 6 characters"} />
      </div>
      <div>
        <label htmlFor="role" style={styles.label}>Role:</label>
        <select id="role" name="role" value={selectRoleValue} onChange={handleChange} style={styles.select}
                disabled={isEditing && user?.role === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN"}>
          {/* No empty/disabled option needed if formData.role is always initialized to a valid role */}
          {availableRoles.map(roleValue => (
            <option key={roleValue} value={roleValue}
                    disabled={(roleValue === "SUPER_ADMIN" && currentUserRole !== "SUPER_ADMIN") && (!isEditing || user?.role !== "SUPER_ADMIN")}>
              {roleValue}
            </option>
          ))}
        </select>
      </div>
      <div style={styles.checkboxLabel}>
        <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} style={styles.checkbox}
               disabled={isEditing && user?.id === "well-known-superadmin-id-placeholder"} />
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

