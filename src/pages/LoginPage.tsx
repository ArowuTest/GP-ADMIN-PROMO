// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService"; // Assuming authService is set up to call your backend

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>(""); // Assuming login is via email as per previous auth.go
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // authService.login should return an object like { token: "...", user: { ... } } or just { token: "..." }
      // The AuthContext expects only the token for its login method.
      const response = await authService.login({ username: email, password }); // Assuming backend uses username, adjust if it's email
      
      if (response && response.token) {
        auth.login(response.token); // Pass only the token to AuthContext
        navigate("/admin/dashboard"); 
      } else {
        throw new Error("Login failed: No token received");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to login. Please check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <h1>Admin Portal Login</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", width: "300px", gap: "10px" }}>
        <div>
          {/* Assuming login with username as per backend JWT generation, change to email if backend expects email */}
          <label htmlFor="username">Username (or Email):</label>
          <input 
            type="text" // Changed from email to text to be more generic, backend uses username in JWT
            id="username" 
            name="username" 
            value={email} // Keeping state variable name as email for now, but it maps to username
            onChange={(e) => setEmail(e.target.value)}
            required 
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ padding: "10px", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {/* Developer notes can be removed or kept for development purposes */}
      <p style={{ marginTop: "20px", fontSize: "0.8em", textAlign: "center", maxWidth: "400px" }}>
        Note: Ensure backend is running. The backend login endpoint expects `username` and `password`.
        The frontend expects the API at <code>{process.env.REACT_APP_API_BASE_URL || "/api/v1"}</code>.
        For local development, create a <code>.env.local</code> file in the frontend root with <code>REACT_APP_API_BASE_URL=http://localhost:8080/api/v1</code> (or your backend URL).
      </p>
    </div>
  );
};

export default LoginPage;

