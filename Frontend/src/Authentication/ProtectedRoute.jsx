import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const userString = localStorage.getItem('user');

  if (!userString) {
    // User is not authenticated, redirect to login
    return <Navigate to="/loginpage" replace />;
  }

  const user = JSON.parse(userString);

  // If roles are restricted, verify access permissions
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role is unauthorized, redirect to their home base route
    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/admin-dashboard" replace />;
      case 'HR':
        return <Navigate to="/hr-dashboard" replace />;
      case 'INTERVIEWER':
        return <Navigate to="/interviewer-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
