// src/services/apiClient.js
// Small fetch wrapper for talking to the FastAPI backend. Native fetch only —
// no axios — per Phase 1 scope (no new required frontend dependency).

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";

const TOKEN_STORAGE_KEY = "staunch_payroll_token";

let inMemoryToken = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    // localStorage can throw in some environments (private browsing, etc.) —
    // the in-memory token still works for the current session.
  }
};

export const getAuthToken = () => {
  if (inMemoryToken) return inMemoryToken;
  try {
    inMemoryToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    inMemoryToken = null;
  }
  return inMemoryToken;
};

export const authHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Extracts a usable error message from a non-2xx response, matching
// FastAPI's standard error shape { "detail": "..." } so existing
// `catch (err) { setError(err.message) }`-style handling keeps working.
const buildErrorFromResponse = async (response) => {
  let detail = `Request failed with status ${response.status}`;
  let structuredDetail = null;
  try {
    const data = await response.json();
    if (data && typeof data.detail === "string") {
      detail = data.detail;
    } else if (data && Array.isArray(data.detail)) {
      // FastAPI validation errors: a list of { loc, msg, type }
      detail = data.detail.map((d) => d.msg).join("; ");
    } else if (data && data.detail && typeof data.detail.message === "string") {
      // Structured rejections, e.g. Excel upload commit ({ message, rows })
      // or bank file generation blocks ({ message, issues, warnings }).
      detail = data.detail.message;
      structuredDetail = data.detail;
    }
  } catch (e) {
    // Response body wasn't JSON — fall back to the generic message above.
  }
  const error = new Error(detail);
  // Callers that need the full structured shape (e.g. the per-employee
  // "issues"/"warnings" lists from a blocked bank file generation) can read
  // err.detail; existing `catch (err) { setError(err.message) }` callers
  // are unaffected.
  if (structuredDetail) {
    error.detail = structuredDetail;
  }
  return error;
};

// A 401 means the session's token is missing/expired/invalid — every
// router now requires one, so this can happen well after the user thought
// they were logged in. Clear the stale token and hard-reset to /login
// (window.location rather than react-router, since this runs outside any
// component and must work no matter which page triggered it) rather than
// leaving the app rendering with a token that no longer works.
const handleUnauthorized = () => {
  setAuthToken(null);
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...authHeader(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized();
    throw await buildErrorFromResponse(response);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const apiGet = (path) => request(path, { method: "GET" });

export const apiPostJson = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body) });

export const apiPutJson = (path, body) =>
  request(path, { method: "PUT", body: JSON.stringify(body) });

export const apiPatchJson = (path, body) =>
  request(path, { method: "PATCH", body: JSON.stringify(body) });

export const apiDelete = (path) => request(path, { method: "DELETE" });

// Multipart form-data POST (file upload) — no Content-Type header is set so
// the browser can add the multipart boundary itself.
export const apiPostForm = async (path, formData) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { ...authHeader() },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized();
    throw await buildErrorFromResponse(response);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const extractFilename = (response, fallback) => {
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  return match ? match[1] : fallback;
};

// GET that returns a binary file (e.g. a generated .xlsx template) rather
// than JSON — returns { blob, filename } so the caller can trigger a
// browser download.
export const apiGetBlob = async (path, fallbackFilename = "download.xlsx") => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { ...authHeader() },
  });

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized();
    throw await buildErrorFromResponse(response);
  }

  const blob = await response.blob();
  const filename = extractFilename(response, fallbackFilename);
  return { blob, filename };
};

export const triggerBlobDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const apiLogin = async (username, password) => {
  const data = await apiPostJson("/auth/login", { username, password });
  setAuthToken(data.access_token);
  return data;
};

export const apiLogout = () => setAuthToken(null);
