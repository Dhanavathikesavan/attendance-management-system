/**
 * Login.jsx
 * Module 1 - Authentication.
 *
 * Flow: this form -> useAuth().login() -> authService -> POST
 * /api/auth/login -> Flask checks the MySQL users table -> on success
 * we store the JWT + user, then redirect to /dashboard.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Attendance Management System</h1>
        <p className="subtitle">Sign in to the admin panel</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: "100%", justifyContent: "center" }}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-hint">
          Default admin credentials — username: <strong>admin</strong>, password: <strong>Admin@123</strong>
        </div>
      </div>
    </div>
  );
}
