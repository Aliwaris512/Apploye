import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../features/auth/authSlice.jsx';
import LoadingScreen from '../common/LoadingScreen';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Simple check for token on each render to avoid stale value
  const hasToken = !!localStorage.getItem('token');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated && !hasToken) {
    const redirectTo = location.pathname !== '/' ? location.pathname + location.search : '/dashboard';
    return <Navigate to="/login" state={{ from: redirectTo }} replace />;
  }

  // When used as a wrapper route (<Route element={<PrivateRoute />}>), render nested routes
  if (!children) {
    return <Outlet />;
  }

  // When used directly with children
  return children;
};

export default PrivateRoute;
