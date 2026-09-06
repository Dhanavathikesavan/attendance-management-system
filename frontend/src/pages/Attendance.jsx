/**
 * Attendance.jsx
 * Module 3 - Attendance Management (mark attendance, view records, summary).
 *
 * Flow (mark):    form submit -> validateAttendanceForm() -> POST
 *                 /api/attendance -> Flask checks the employee exists,
 *                 then INSERTs -> MySQL's UNIQUE(employee_id, date)
 *                 constraint rejects duplicates with a 409.
 * Flow (records): on mount / filter change -> GET /api/attendance
 * Flow (summary): on mount -> GET /api/attendance/summary
 */
import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { validateAttendanceForm } from "../utils/validators";
import { getEmployees } from "../services/employeeService";
import { getAttendance, getAttendanceSummary, markAttendance } from "../services/attendanceService";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  employee_id: "",
  attendance_date: today(),
  check_in_time: "",
  check_out_time: "",
  attendance_status: "Present",
};

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState("");

  // Load the employee dropdown once
  useEffect(() => {
    getEmployees({ status: "Active" }).then(setEmployees).catch(() => {});
  }, []);

  async function loadRecordsAndSummary() {
    setLoadingRecords(true);
    setRecordsError("");
    try {
      const [recordsData, summaryData] = await Promise.all([
        getAttendance({ date: dateFilter, status: statusFilter }),
        getAttendanceSummary(),
      ]);
      setRecords(recordsData);
      setSummary(summaryData);
    } catch (err) {
      setRecordsError(err.message);
    } finally {
      setLoadingRecords(false);
    }
  }

  useEffect(() => {
    loadRecordsAndSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, statusFilter]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormMessage({ type: "", text: "" });

    const validationErrors = validateAttendanceForm(form);
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await markAttendance({
        ...form,
        check_in_time: form.check_in_time || null,
        check_out_time: form.check_out_time || null,
      });
      setFormMessage({ type: "success", text: "Attendance marked successfully." });
      setForm({ ...emptyForm, attendance_date: form.attendance_date });
      loadRecordsAndSummary();
    } catch (err) {
      setFormMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Attendance</h2>
          <p>Mark daily attendance and review attendance records.</p>
        </div>
      </div>

      {summary && (
        <div className="stat-grid">
          <StatCard label="Total Records" value={summary.total_records} accent="blue" />
          <StatCard label="Present" value={summary.present_count} accent="green" />
          <StatCard label="Absent" value={summary.absent_count} accent="red" />
          <StatCard label="Leave" value={summary.leave_count} accent="amber" />
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Mark Attendance</h3>

        {formMessage.text && (
          <div className={`alert ${formMessage.type === "error" ? "alert-error" : "alert-success"}`}>
            {formMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="employee_id">Employee</label>
              <select
                id="employee_id"
                value={form.employee_id}
                onChange={(e) => handleChange("employee_id", e.target.value)}
                className={formErrors.employee_id ? "input-error" : ""}
              >
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_id} - {emp.employee_name}
                  </option>
                ))}
              </select>
              {formErrors.employee_id && <span className="field-error">{formErrors.employee_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="attendance_date">Date</label>
              <input
                id="attendance_date"
                type="date"
                value={form.attendance_date}
                onChange={(e) => handleChange("attendance_date", e.target.value)}
                className={formErrors.attendance_date ? "input-error" : ""}
              />
              {formErrors.attendance_date && <span className="field-error">{formErrors.attendance_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="attendance_status">Status</label>
              <select
                id="attendance_status"
                value={form.attendance_status}
                onChange={(e) => handleChange("attendance_status", e.target.value)}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="check_in_time">Check-In Time</label>
              <input
                id="check_in_time"
                type="time"
                value={form.check_in_time}
                onChange={(e) => handleChange("check_in_time", e.target.value)}
                disabled={form.attendance_status !== "Present"}
              />
            </div>

            <div className="form-group">
              <label htmlFor="check_out_time">Check-Out Time</label>
              <input
                id="check_out_time"
                type="time"
                value={form.check_out_time}
                onChange={(e) => handleChange("check_out_time", e.target.value)}
                disabled={form.attendance_status !== "Present"}
                className={formErrors.check_out_time ? "input-error" : ""}
              />
              {formErrors.check_out_time && <span className="field-error">{formErrors.check_out_time}</span>}
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Mark Attendance"}
          </button>
        </form>
      </div>

      <div className="toolbar">
        <h3>Attendance Records</h3>
        <div className="toolbar-filters">
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>
          {(dateFilter || statusFilter) && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setDateFilter("");
                setStatusFilter("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {recordsError && <div className="alert alert-error">{recordsError}</div>}

      <div className="table-wrapper">
        {loadingRecords ? (
          <LoadingSpinner label="Loading attendance records" />
        ) : records.length === 0 ? (
          <div className="empty-state">No attendance records found for the selected filters.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.attendance_id}>
                  <td>{rec.attendance_date}</td>
                  <td>{rec.employee_name}</td>
                  <td>{rec.department}</td>
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
    </div>
  );
}
