// src/utils/auth.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000";

export function getToken() {
  return localStorage.getItem("authToken");
}
