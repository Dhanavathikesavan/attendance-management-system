/**
 * Sidebar.jsx
 * Left-hand navigation between the four modules: Dashboard, Employees,
 * Attendance, Attendance History.
 */
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/employees", label: "Employees" },
  { to: "/attendance", label: "Attendance" },
  { to: "/attendance-history", label: "Attendance History" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>Attendance MS</h1>
        <span>Admin Panel</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">Mini Attendance Management System</div>
    </aside>
  );
}
