/**
 * ProtectedRoute.jsx
 * Wraps pages that require a logged-in admin. If there's no user in
 * AuthContext, it redirects to /login instead of rendering the page.
 * Also renders the shared Sidebar + Topbar shell around the page.
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function ProtectedRoute({ title, children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Topbar title={title} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
