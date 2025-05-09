import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
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
      const response = await authService.login({ email, password });
      auth.login(response.token, response.user); // Update context and localStorage
      navigate("/admin/dashboard"); // Redirect to dashboard on successful login
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <h1>Admin Portal Login</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", width: "300px", gap: "10px" }}>
        <div>
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={email}
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
      {/* The development note paragraph below has been removed */}
    </div>
  );
};

export default LoginPage;

