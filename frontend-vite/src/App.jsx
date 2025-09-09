import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages - Auth
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Pages - Main
import DashboardPage from './pages/DashboardPage';
import ProjectsList from './pages/ProjectsList';
import ProjectDetail from './pages/ProjectDetail';
import TimeTrackingPage from './pages/TimeTrackingPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import PrivateRoute from './components/routing/PrivateRoute';
import ProtectedRoute from './components/routing/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          } />
          
          <Route path="/projects" element={
            <MainLayout>
              <ProjectsList />
            </MainLayout>
          } />

          <Route path="/projects/:projectId" element={
            <MainLayout>
              <ProjectDetail />
            </MainLayout>
          } />
          
          <Route path="/time-tracking" element={
            <MainLayout>
              <TimeTrackingPage />
            </MainLayout>
          } />

          <Route element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="team" element={<div>Team Management - Coming Soon</div>} />
            <Route path="reports" element={<div>Reports - Coming Soon</div>} />
            <Route path="payroll" element={<div>Payroll - Coming Soon</div>} />
          </Route>

          <Route path="profile" element={
            <MainLayout>
              <div>Profile - Coming Soon</div>
            </MainLayout>
          } />

          <Route path="settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout>
                <div>Settings - Coming Soon</div>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={
            <MainLayout>
              <div>Page Not Found</div>
            </MainLayout>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
