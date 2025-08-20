import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Redirect to login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if route requires specific role
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to unauthorized or dashboard if user doesn't have required role
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
