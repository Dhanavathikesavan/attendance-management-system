/**
 * useAuth.js
 * ----------
 * Small convenience hook so components can write:
 *   const { user, login, logout } = useAuth();
 * instead of importing useContext + AuthContext everywhere.
 */
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
}
