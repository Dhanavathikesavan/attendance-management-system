/**
 * Employees.jsx
 * Module 2 - Employee Management (list, search, delete).
 * Adding/editing happens on EmployeeForm.jsx, viewing on EmployeeDetails.jsx.
 *
 * Flow: on mount / whenever the search box changes -> employeeService
 * .getEmployees() -> GET /api/employees?search=... -> Flask builds a
 * SQL query with LIKE/= filters -> MySQL -> table re-renders.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { getEmployees, deleteEmployee } from "../services/employeeService";

export default function Employees() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  async function loadEmployees() {
    setLoading(true);
    setError("");
    try {
      const data = await getEmployees({ search, status: statusFilter });
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Re-fetch whenever the search/filter changes (debounced slightly
  // so we don't fire an API call on every single keystroke).
  useEffect(() => {
    const timeoutId = setTimeout(loadEmployees, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  async function handleConfirmDelete() {
    try {
      await deleteEmployee(employeeToDelete.employee_id);
      setSuccessMessage(`${employeeToDelete.employee_name} was deleted successfully.`);
      setEmployeeToDelete(null);
      loadEmployees();
    } catch (err) {
      setError(err.message);
      setEmployeeToDelete(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Employees</h2>
          <p>Add, search, edit, and manage employee records.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/employees/new")}>
          + Add Employee
        </button>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <div className="toolbar-filters">
          <input
            type="text"
            placeholder="Search by name, ID, email, or department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 280 }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <LoadingSpinner label="Loading employees" />
        ) : employees.length === 0 ? (
          <div className="empty-state">No employees found. Try adjusting your search, or add a new employee.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>{emp.employee_id}</td>
                  <td>{emp.employee_name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.mobile_number}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>
                    <StatusBadge value={emp.status} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link className="btn btn-outline btn-sm" to={`/employees/${emp.employee_id}`}>
                        View
                      </Link>
                      <Link className="btn btn-outline btn-sm" to={`/employees/${emp.employee_id}/edit`}>
                        Edit
                      </Link>
                      <button className="btn btn-danger btn-sm" onClick={() => setEmployeeToDelete(emp)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {employeeToDelete && (
        <ConfirmModal
          title="Delete employee?"
          message={`This will permanently delete ${employeeToDelete.employee_name} and all of their attendance records. This cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setEmployeeToDelete(null)}
        />
      )}
    </div>
  );
}
