/**
 * App.jsx
 * Defines all client-side routes with React Router.
 * Every page except /login is wrapped in <ProtectedRoute>, which
 * redirects to /login if the user isn't authenticated and renders
 * the shared Sidebar/Topbar shell around the page.
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeForm from "./pages/EmployeeForm";
import EmployeeDetails from "./pages/EmployeeDetails";
import Attendance from "./pages/Attendance";
import AttendanceHistory from "./pages/AttendanceHistory";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute title="Dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute title="Employees">
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/new"
          element={
            <ProtectedRoute title="Add Employee">
              <EmployeeForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute title="Employee Details">
              <EmployeeDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id/edit"
          element={
            <ProtectedRoute title="Edit Employee">
              <EmployeeForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute title="Attendance">
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance-history"
          element={
            <ProtectedRoute title="Attendance History">
              <AttendanceHistory />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
