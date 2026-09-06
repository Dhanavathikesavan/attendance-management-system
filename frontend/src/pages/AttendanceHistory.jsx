/**
 * AttendanceHistory.jsx
 * Module 3 - Employee-wise Attendance History.
 *
 * Flow: pick an employee -> GET /api/attendance/employee/<id> -> Flask
 * confirms the employee exists, then SELECTs all their attendance rows
 * ordered by date -> MySQL.
 *
 * Also computes "Attendance %" (Present days / Total days * 100) on the
 * frontend from the already-fetched history -- this is a simple derived
 * number, not a new database query, matching the "Attendance Percentage"
 * enhancement described in the assessment brief.
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getEmployees } from "../services/employeeService";
import { getEmployeeAttendanceHistory } from "../services/attendanceService";

export default function AttendanceHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedId = searchParams.get("employee_id") || "";

  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState(preselectedId);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getEmployees().then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setHistory(null);
      return;
    }

    setLoading(true);
    setError("");
    getEmployeeAttendanceHistory(selectedId)
      .then(setHistory)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedId]);

  function handleSelect(id) {
    setSelectedId(id);
    setSearchParams(id ? { employee_id: id } : {});
  }

  // Attendance % = Present days / Total recorded days * 100
  const records = history?.history || [];
  const presentCount = records.filter((r) => r.attendance_status === "Present").length;
  const attendancePercent = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Attendance History</h2>
          <p>View an individual employee's full attendance record.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="form-group" style={{ maxWidth: 360, marginBottom: 0 }}>
          <label htmlFor="employee_select">Select Employee</label>
          <select id="employee_select" value={selectedId} onChange={(e) => handleSelect(e.target.value)}>
            <option value="">Choose an employee</option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.employee_id} - {emp.employee_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <LoadingSpinner label="Loading history" />}

      {history && !loading && (
        <>
          <div className="stat-grid">
            <StatCard label="Total Records" value={records.length} accent="blue" />
            <StatCard label="Present Days" value={presentCount} accent="green" />
            <StatCard label="Attendance %" value={`${attendancePercent}%`} accent="amber" />
          </div>

          <div className="table-wrapper">
            {records.length === 0 ? (
              <div className="empty-state">No attendance records yet for {history.employee.employee_name}.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => (
                    <tr key={rec.attendance_id}>
                      <td>{rec.attendance_date}</td>
                      <td>{rec.check_in_time || "—"}</td>
                      <td>{rec.check_out_time || "—"}</td>
                      <td>
                        <StatusBadge value={rec.attendance_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
