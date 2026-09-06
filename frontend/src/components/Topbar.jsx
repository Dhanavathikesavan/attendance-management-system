/**
 * Topbar.jsx
 * Shows the current page title plus the logged-in username and a
 * logout button. `title` is passed in by each page.
 */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <h2>{title}</h2>
      <div className="topbar-user">
        <span>
          Signed in as <strong>{user?.username}</strong>
        </span>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
