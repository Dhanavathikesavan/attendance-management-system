/**
 * api.js
 * ------
 * A single, central place that knows how to talk to the Flask backend.
 * Every other service (authService, employeeService, ...) calls
 * `apiRequest()` instead of using `fetch` directly. Benefits:
 *   - the base URL is defined once (from .env)
 *   - the JWT token is attached automatically on every request
 *   - error handling / JSON parsing is consistent everywhere
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_STORAGE_KEY = "attendance_token";

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Makes an API request and returns the parsed JSON body's `data` field.
 * Throws an Error with a user-friendly message on any failure so callers
 * can simply try/catch and show err.message to the user.
 *
 * @param {string} endpoint - e.g. "/employees" or "/auth/login"
 * @param {object} options - { method, body, auth }
 */
export async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, auth = true } = options;

  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error("Could not reach the server. Is the Flask backend running?");
  }

  // Session expired / invalid token -> force the user back to login
  if (response.status === 401 && auth) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error((payload && payload.message) || "Something went wrong.");
  }

  return payload ? payload.data : null;
}
