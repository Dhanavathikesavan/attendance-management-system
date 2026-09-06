/**
 * employeeService.js
 * ------------------
 * All Employee Management API calls (Module 2).
 */
import { apiRequest } from "./api";

export function getEmployees({ search = "", department = "", status = "" } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (department) params.set("department", department);
  if (status) params.set("status", status);
  const query = params.toString();
  return apiRequest(`/employees${query ? `?${query}` : ""}`);
}

export function getEmployee(employeeId) {
  return apiRequest(`/employees/${employeeId}`);
}

export function createEmployee(payload) {
  return apiRequest("/employees", { method: "POST", body: payload });
}

export function updateEmployee(employeeId, payload) {
  return apiRequest(`/employees/${employeeId}`, { method: "PUT", body: payload });
}

export function deleteEmployee(employeeId) {
  return apiRequest(`/employees/${employeeId}`, { method: "DELETE" });
}
