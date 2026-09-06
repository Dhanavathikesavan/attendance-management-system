/**
 * dashboardService.js
 * --------------------
 * Dashboard statistics API call (Module 4). All numbers are calculated
 * in MySQL/Flask -- this file just fetches the already-computed result.
 */
import { apiRequest } from "./api";

export function getDashboardStats() {
  return apiRequest("/dashboard/stats");
}
