/**
 * authService.js
 * --------------
 * Wraps the single auth API call: POST /api/auth/login
 */
import { apiRequest } from "./api";

export function login(username, password) {
  // auth: false -> this request does not send a token (we don't have one yet)
  return apiRequest("/auth/login", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
}
