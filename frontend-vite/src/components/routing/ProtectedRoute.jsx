import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  selectCurrentUser, 
  selectIsAuthenticated, 
  selectAuthLoading 
} from '../../features/auth/authSlice.jsx';
import LoadingScreen from '../common/LoadingScreen';

/**
 * A protected route component that checks for authentication and role-based access
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child components to render if authorized
 * @param {string[]} [props.allowedRoles] - Array of allowed roles (e.g., ['admin', 'manager'])
 * @param {string} [props.redirectTo] - Path to redirect to if not authorized (default: '/unauthorized')
 * @returns {React.ReactNode} The protected route component
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/unauthorized' 
}) => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const location = useLocation();

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen message="Verifying permissions..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles required, allow access
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has any of the allowed roles
  const hasRequiredRole = user?.role && allowedRoles.includes(user.role);
  
  // Redirect to unauthorized page if user doesn't have required role
  if (!hasRequiredRole) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute;
