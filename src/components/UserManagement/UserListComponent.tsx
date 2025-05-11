// Placeholder for User List Component
// This component will display a list of admin users and provide options to manage them.

import { useState, useEffect } from "react";
import { useAuth, type UserRole } from "../../contexts/AuthContext"; // Adjusted path

// Mock data types - replace with actual types from API/models
interface User {
  id: number;
  username: string;
  role: UserRole; // Using UserRole type from AuthContext
}

const UserListComponent = () => {
  const { userRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Corrected role comparison to use SCREAMING_SNAKE_CASE
    if (userRole !== "SUPER_ADMIN") return; // Only SuperAdmin can list users

    setIsLoading(true);
    // Mock API call to fetch users
    console.log("Fetching users...");
    setTimeout(() => {
      setUsers([
        // Corrected mock data roles to use SCREAMING_SNAKE_CASE
        { id: 1, username: "superadmin", role: "SUPER_ADMIN" },
        { id: 2, username: "admin_user", role: "ADMIN" },
        { id: 3, username: "reporter", role: "WINNER_REPORTS_USER" },
        { id: 4, username: "senior_user", role: "SENIOR_USER" },
        { id: 5, username: "all_reports_user", role: "ALL_REPORT_USER" },
      ]);
      setIsLoading(false);
    }, 1000);
  }, [userRole]);

  // Corrected role comparison to use SCREAMING_SNAKE_CASE
  if (userRole !== "SUPER_ADMIN") {
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


