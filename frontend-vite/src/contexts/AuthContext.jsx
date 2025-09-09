import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectCurrentUser, 
  selectIsAuthenticated,
  initializeAuth
} from '../features/auth/authSlice.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Initialize auth state when component mounts
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Check if user has any of the specified roles
  const hasRole = (roles = []) => {
    if (!user || !user.role) return false;
    if (roles.length === 0) return true; // No specific role required
    return roles.includes(user.role);
  };

  // Check if user has any of the specified permissions
  const hasPermission = (permissions = []) => {
    if (!user || !user.permissions) return false;
    if (permissions.length === 0) return true; // No specific permission required
    return permissions.some(permission => user.permissions.includes(permission));
  };

  const value = {
    user,
    isAuthenticated,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
