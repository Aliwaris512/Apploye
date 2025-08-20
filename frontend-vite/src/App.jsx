import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';

// Components
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';

// Wrapper component for protected routes
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
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Main App component
function AppContent() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="activity" element={<Activity />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Admin Only Routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Error Routes */}
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

// App wrapper with providers
function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={5000}
        >
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
