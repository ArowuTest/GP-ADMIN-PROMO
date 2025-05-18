// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";

const LoginPage: React.FC = () => {
  const [usernameInput, setUsernameInput] = useState<string>("");
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
      const response = await authService.login({ username: usernameInput, password });

      if (response && response.token) {
        auth.login(response.token);
        navigate("/admin/dashboard");
      } else {
        throw new Error("Login failed: No token received");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.message ||
        "Failed to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <h1>Admin Portal Login</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "300px",
          gap: "10px",
        }}
      >
        <div>
          <label htmlFor="username">Username (or Email):</label>
          <input
            type="text" 
            id="username"
            name="username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
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
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p style={{ marginTop: "20px", fontSize: "0.8em", textAlign: "center", maxWidth: "400px" }}>
        Note: The backend login endpoint expects `username` and `password`.
      </p>
    </div>
  );
};

export default LoginPage;
