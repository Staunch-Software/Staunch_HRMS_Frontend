import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../../services/apiClient";

// Route guard for everything under /app: with no stored token, bounce
// straight to /login instead of letting the page render and then fail on
// its first API call with a 401.
const RequireAuth = ({ children }) => {
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RequireAuth;
