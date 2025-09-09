import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  selectCurrentUser, 
  selectIsAuthenticated, 
  selectAuthLoading 
} from '../../features/auth/authSlice.jsx';
import LoadingScreen from '../common/LoadingScreen';

const AdminRoute = ({ children }) => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has admin or manager role
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';
  
  if (!isAdmin) {
    // Redirect to unauthorized page if not admin/manager
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AdminRoute;
