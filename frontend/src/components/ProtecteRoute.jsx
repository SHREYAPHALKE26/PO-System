import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("authToken");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  if (!token) return <Navigate to="/login" />;
  if (!allowedRoles.some((r) => roles.includes(r)))
    return <Navigate to="/unauthorized" />;

  return children;
};

export default ProtectedRoute;
