/**
 * AuthContext.jsx
 * ---------------
 * Holds the currently logged-in user (or null) in one place, so any
 * component can ask "who is logged in?" via the useAuth() hook instead
 * of passing the user down through props everywhere.
 *
 * On successful login we save the JWT token (in localStorage, via
 * api.js) and the user's basic info (in localStorage + this context)
 * so a page refresh doesn't log the user out.
 */
import { createContext, useState } from "react";
import { login as loginRequest } from "../services/authService";
import { setToken, clearToken } from "../services/api";

const USER_STORAGE_KEY = "attendance_user";

export const AuthContext = createContext(null);

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  async function login(username, password) {
    // authService -> POST /api/auth/login -> Flask -> MySQL users table
    const data = await loginRequest(username, password);
    setToken(data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    clearToken();
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }

  const value = { user, isAuthenticated: !!user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
