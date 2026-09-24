import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading session...</span>
      </div>
    );
  }

  // No token or user logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check roles authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if they try to access wrong route
    if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.role === 'owner') {
      return <Navigate to="/owner-dashboard" replace />;
    } else {
      return <Navigate to="/tenant-dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
