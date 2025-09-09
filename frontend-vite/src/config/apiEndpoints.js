// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
};

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/users/me`,
  CHANGE_PASSWORD: `${API_BASE_URL}/users/change-password`,
  PREFERENCES: `${API_BASE_URL}/users/me/preferences`,
  AVATAR: `${API_BASE_URL}/users/me/avatar`,
  ALL_USERS: `${API_BASE_URL}/users`,
  USER_BY_ID: (userId) => `${API_BASE_URL}/users/${userId}`,
  USER_ROLES: `${API_BASE_URL}/users/roles`,
};

// Project endpoints
export const PROJECT_ENDPOINTS = {
  PROJECTS: `${API_BASE_URL}/projects`,
  PROJECT_BY_ID: (projectId) => `${API_BASE_URL}/projects/${projectId}`,
  PROJECT_TEAM: (projectId) => 
    `${API_BASE_URL}/projects/${projectId}/team`,
  PROJECT_TEAM_MEMBER: (projectId, userId) => 
    `${API_BASE_URL}/projects/${projectId}/team/${userId}`,
  PROJECT_FILES: (projectId) => 
    `${API_BASE_URL}/projects/${projectId}/files`,
  PROJECT_FILE: (projectId, fileId) => 
    `${API_BASE_URL}/projects/${projectId}/files/${fileId}`,
  PROJECT_FILE_DOWNLOAD: (projectId, fileId) => 
    `${API_BASE_URL}/projects/${projectId}/files/${fileId}/download`,
  PROJECT_TASKS: (projectId) => 
    `${API_BASE_URL}/projects/${projectId}/tasks`,
  PROJECT_TASK: (projectId, taskId) => 
    `${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`,
  PROJECT_TIMELINE: (projectId) => 
    `${API_BASE_URL}/projects/${projectId}/timeline`,
};

// Task endpoints
export const TASK_ENDPOINTS = {
  TASKS: `${API_BASE_URL}/tasks`,
  TASK_BY_ID: (taskId) => `${API_BASE_URL}/tasks/${taskId}`,
  TASK_COMMENTS: (taskId) => 
    `${API_BASE_URL}/tasks/${taskId}/comments`,
  TASK_COMMENT: (taskId, commentId) => 
    `${API_BASE_URL}/tasks/${taskId}/comments/${commentId}`,
  TASK_ASSIGNEES: (taskId) => 
    `${API_BASE_URL}/tasks/${taskId}/assignees`,
  TASK_ASSIGNEE: (taskId, userId) => 
    `${API_BASE_URL}/tasks/${taskId}/assignees/${userId}`,
};

// File endpoints
export const FILE_ENDPOINTS = {
  UPLOAD: (projectId) => 
    `${API_BASE_URL}/projects/${projectId}/files`,
  DOWNLOAD: (projectId, fileId) => 
    `${API_BASE_URL}/projects/${projectId}/files/${fileId}/download`,
  PREVIEW: (projectId, fileId) => 
    `${API_BASE_URL}/projects/${projectId}/files/${fileId}/preview`,
  THUMBNAIL: (projectId, fileId) => 
    `${API_BASE_URL}/projects/${projectId}/files/${fileId}/thumbnail`,
};

// Analytics endpoints
export const ANALYTICS_ENDPOINTS = {
  PROJECT_ANALYTICS: (projectId) => 
    `${API_BASE_URL}/analytics/projects/${projectId}`,
  TEAM_ANALYTICS: `${API_BASE_URL}/analytics/team`,
  TIME_TRACKING: `${API_BASE_URL}/analytics/time-tracking`,
  PRODUCTIVITY: `${API_BASE_URL}/analytics/productivity`,
  ACTIVITY_LOGS: `${API_BASE_URL}/analytics/activity-logs`,
};

// Billing endpoints
export const BILLING_ENDPOINTS = {
  INVOICES: `${API_BASE_URL}/billing/invoices`,
  INVOICE_BY_ID: (invoiceId) => 
    `${API_BASE_URL}/billing/invoices/${invoiceId}`,
  SEND_INVOICE: (invoiceId) => 
    `${API_BASE_URL}/billing/invoices/${invoiceId}/send`,
  MARK_AS_PAID: (invoiceId) => 
    `${API_BASE_URL}/billing/invoices/${invoiceId}/mark-as-paid`,
  DOWNLOAD_INVOICE: (invoiceId) => 
    `${API_BASE_URL}/billing/invoices/${invoiceId}/download`,
  PAYMENT_METHODS: `${API_BASE_URL}/billing/payment-methods`,
  SUBSCRIPTION: `${API_BASE_URL}/billing/subscription`,
  USAGE: `${API_BASE_URL}/billing/usage`,
};

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  NOTIFICATION_BY_ID: (notificationId) => 
    `${API_BASE_URL}/notifications/${notificationId}`,
  MARK_ALL_READ: `${API_BASE_URL}/notifications/mark-all-read`,
  MARK_AS_READ: (notificationId) => 
    `${API_BASE_URL}/notifications/${notificationId}/read`,
  PREFERENCES: `${API_BASE_URL}/notifications/preferences`,
  UNREAD_COUNT: `${API_BASE_URL}/notifications/unread-count`,
};

// Report endpoints
export const REPORT_ENDPOINTS = {
  REPORTS: `${API_BASE_URL}/reports`,
  REPORT_BY_ID: (reportId) => 
    `${API_BASE_URL}/reports/${reportId}`,
  DOWNLOAD_REPORT: (reportId) => 
    `${API_BASE_URL}/reports/${reportId}/download`,
  GENERATE_REPORT: `${API_BASE_URL}/reports/generate`,
  REPORT_TYPES: `${API_BASE_URL}/reports/types`,
};

// WebSocket endpoints
export const WS_ENDPOINTS = {
  BASE: process.env.REACT_APP_WS_URL || 
    `ws://${window.location.hostname}:5000/ws`,
  NOTIFICATIONS: '/topic/notifications',
  ACTIVITY_UPDATES: '/topic/activity-updates',
  PROJECT_UPDATES: (projectId) => 
    `/topic/projects/${projectId}/updates`,
  TASK_UPDATES: (taskId) => 
    `/topic/tasks/${taskId}/updates`,
  CHAT: (channelId) => 
    `/topic/chat/${channelId}`,
};

// Export all endpoints for convenience
export default {
  ...AUTH_ENDPOINTS,
  ...USER_ENDPOINTS,
  ...PROJECT_ENDPOINTS,
  ...TASK_ENDPOINTS,
  ...FILE_ENDPOINTS,
  ...ANALYTICS_ENDPOINTS,
  ...BILLING_ENDPOINTS,
  ...NOTIFICATION_ENDPOINTS,
  ...REPORT_ENDPOINTS,
  ...WS_ENDPOINTS,
  API_BASE_URL,
};
