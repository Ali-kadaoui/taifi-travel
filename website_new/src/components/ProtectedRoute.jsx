import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ProtectedRoute({ children }) {
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!user) {
    // Redirect to login page and keep the previous location in state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
