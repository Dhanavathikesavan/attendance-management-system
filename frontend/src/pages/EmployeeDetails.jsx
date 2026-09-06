/**
 * EmployeeDetails.jsx
 * Module 2 - View Employee Details.
 *
 * Flow: on mount -> employeeService.getEmployee(id) -> GET
 * /api/employees/<id> -> Flask -> SELECT * FROM employees WHERE
 * employee_id = <id> -> MySQL.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { getEmployee } from "../services/employeeService";

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployee(id)
      .then(setEmployee)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading employee" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{employee.employee_name}</h2>
          <p>Employee ID #{employee.employee_id}</p>
        </div>
        <div className="table-actions">
          <Link className="btn btn-outline" to={`/attendance-history?employee_id=${employee.employee_id}`}>
            View Attendance History
          </Link>
          <Link className="btn btn-primary" to={`/employees/${employee.employee_id}/edit`}>
            Edit
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Email Address</div>
            <div className="detail-value">{employee.email}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Mobile Number</div>
            <div className="detail-value">{employee.mobile_number}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Department</div>
            <div className="detail-value">{employee.department}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Designation</div>
            <div className="detail-value">{employee.designation}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Status</div>
            <div className="detail-value">
              <StatusBadge value={employee.status} />
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Added On</div>
            <div className="detail-value">{new Date(employee.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-outline" onClick={() => navigate("/employees")}>
          Back to Employees
        </button>
      </div>
    </div>
  );
}
