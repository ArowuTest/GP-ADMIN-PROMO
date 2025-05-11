// Placeholder for User List Component
// This component will display a list of admin users and provide options to manage them.

import React, { useState, useEffect } from "react";
import { useAuth, UserRole } from "../../contexts/AuthContext"; // Adjusted path

// Mock data types - replace with actual types from API/models
interface User {
  id: number;
  username: string;
  role: UserRole;
}

const UserListComponent = () => {
  const { userRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (userRole !== "SuperAdmin") return; // Only SuperAdmin can list users

    setIsLoading(true);
    // Mock API call to fetch users
    console.log("Fetching users...");
    setTimeout(() => {
      setUsers([
        { id: 1, username: "superadmin", role: "SuperAdmin" },
        { id: 2, username: "admin_user", role: "Admin" },
        { id: 3, username: "reporter", role: "WinnerReportsUser" },
        { id: 4, username: "senior_user", role: "SeniorUser" },
        { id: 5, username: "all_reports_user", role: "AllReportUser" },
      ]);
      setIsLoading(false);
    }, 1000);
  }, [userRole]);

  if (userRole !== "SuperAdmin") {
    return <p>You do not have permission to manage users.</p>;
  }

  if (isLoading) {
    return <p>Loading users...</p>;
  }

  return (
    <div>
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button>Add New User</button>
    </div>
  );
};

export default UserListComponent;

