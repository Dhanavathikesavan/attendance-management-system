/**
 * attendanceService.js
 * ---------------------
 * All Attendance Management API calls (Module 3).
 */
import { apiRequest } from "./api";

export function markAttendance(payload) {
  return apiRequest("/attendance", { method: "POST", body: payload });
}

export function getAttendance({ date = "", status = "" } = {}) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (status) params.set("status", status);
  const query = params.toString();
  return apiRequest(`/attendance${query ? `?${query}` : ""}`);
}

export function getAttendanceSummary() {
  return apiRequest("/attendance/summary");
}

export function getEmployeeAttendanceHistory(employeeId) {
  return apiRequest(`/attendance/employee/${employeeId}`);
}
