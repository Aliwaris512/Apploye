import axios from 'axios';
import {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  PROJECT_ENDPOINTS,
  TASK_ENDPOINTS,
  FILE_ENDPOINTS,
  ANALYTICS_ENDPOINTS,
  BILLING_ENDPOINTS,
  NOTIFICATION_ENDPOINTS,
  REPORT_ENDPOINTS
} from '../config/apiEndpoints';

// Create axios instance with base URL and headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post(AUTH_ENDPOINTS.LOGIN, credentials),
  register: (userData) => api.post(AUTH_ENDPOINTS.REGISTER, userData),
  refreshToken: () => api.post(AUTH_ENDPOINTS.REFRESH_TOKEN),
  forgotPassword: (email) => api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email }),
  resetPassword: (data) => api.post(AUTH_ENDPOINTS.RESET_PASSWORD, data),
  logout: () => api.post(AUTH_ENDPOINTS.LOGOUT),
};

// Projects API
export const projectsAPI = {
  // Basic CRUD operations
  getAll: (params) => api.get(PROJECT_ENDPOINTS.PROJECTS, { params }),
  getById: (id) => api.get(PROJECT_ENDPOINTS.PROJECT_BY_ID(id)),
  create: (projectData) => api.post(PROJECT_ENDPOINTS.PROJECTS, projectData),
  update: (id, projectData) => 
    api.put(PROJECT_ENDPOINTS.PROJECT_BY_ID(id), projectData),
  delete: (id) => api.delete(PROJECT_ENDPOINTS.PROJECT_BY_ID(id)),
  
  // Team management
  getTeam: (projectId) => api.get(PROJECT_ENDPOINTS.PROJECT_TEAM(projectId)),
  addTeamMember: (projectId, memberData) => 
    api.post(PROJECT_ENDPOINTS.PROJECT_TEAM(projectId), memberData),
  removeTeamMember: (projectId, userId) => 
    api.delete(PROJECT_ENDPOINTS.PROJECT_TEAM_MEMBER(projectId, userId)),
  updateMemberRole: (projectId, userId, role) => 
    api.patch(PROJECT_ENDPOINTS.PROJECT_TEAM_MEMBER(projectId, userId), { role }),
  
  // Project tasks
  getTasks: (projectId, params) => 
    api.get(PROJECT_ENDPOINTS.PROJECT_TASKS(projectId), { params }),
  createTask: (projectId, taskData) => 
    api.post(PROJECT_ENDPOINTS.PROJECT_TASKS(projectId), taskData),
  getTask: (projectId, taskId) => 
    api.get(PROJECT_ENDPOINTS.PROJECT_TASK(projectId, taskId)),
  updateTask: (projectId, taskId, taskData) => 
    api.put(PROJECT_ENDPOINTS.PROJECT_TASK(projectId, taskId), taskData),
  deleteTask: (projectId, taskId) => 
    api.delete(PROJECT_ENDPOINTS.PROJECT_TASK(projectId, taskId)),
  
  // Project timeline
  getTimeline: (projectId) => 
    api.get(PROJECT_ENDPOINTS.PROJECT_TIMELINE(projectId)),
};

// Files API
export const filesAPI = {
  // File operations
  upload: (projectId, file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(FILE_ENDPOINTS.UPLOAD(projectId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  
  // File management
  getAll: (projectId) => api.get(PROJECT_ENDPOINTS.PROJECT_FILES(projectId)),
  getById: (projectId, fileId) => 
    api.get(PROJECT_ENDPOINTS.PROJECT_FILE(projectId, fileId)),
  delete: (projectId, fileId) => 
    api.delete(PROJECT_ENDPOINTS.PROJECT_FILE(projectId, fileId)),
  
  // File downloads and previews
  download: (projectId, fileId) => 
    api.get(FILE_ENDPOINTS.DOWNLOAD(projectId, fileId), {
      responseType: 'blob',
    }),
  preview: (projectId, fileId) => 
    api.get(FILE_ENDPOINTS.PREVIEW(projectId, fileId), {
      responseType: 'blob',
    }),
  thumbnail: (projectId, fileId) => 
    api.get(FILE_ENDPOINTS.THUMBNAIL(projectId, fileId), {
      responseType: 'blob',
    }),
};

// Analytics API
export const analyticsAPI = {
  // Project analytics
  getProjectAnalytics: (projectId, params) => 
    api.get(ANALYTICS_ENDPOINTS.PROJECT_ANALYTICS(projectId), { params }),
    
  // Team analytics
  getTeamAnalytics: (params) => 
    api.get(ANALYTICS_ENDPOINTS.TEAM_ANALYTICS, { params }),
    
  // Time tracking
  getTimeTracking: (params) => 
    api.get(ANALYTICS_ENDPOINTS.TIME_TRACKING, { params }),
    
  // Productivity metrics
  getProductivityMetrics: (params) => 
    api.get(ANALYTICS_ENDPOINTS.PRODUCTIVITY, { params }),
    
  // Activity logs
  getActivityLogs: (params) => 
    api.get(ANALYTICS_ENDPOINTS.ACTIVITY_LOGS, { params }),
};

// Billing API
export const billingAPI = {
  // Invoices
  getInvoices: (params) => api.get(BILLING_ENDPOINTS.INVOICES, { params }),
  getInvoice: (invoiceId) => api.get(BILLING_ENDPOINTS.INVOICE_BY_ID(invoiceId)),
  createInvoice: (invoiceData) => api.post(BILLING_ENDPOINTS.INVOICES, invoiceData),
  updateInvoice: (invoiceId, invoiceData) => 
    api.put(BILLING_ENDPOINTS.INVOICE_BY_ID(invoiceId), invoiceData),
  deleteInvoice: (invoiceId) => 
    api.delete(BILLING_ENDPOINTS.INVOICE_BY_ID(invoiceId)),
  sendInvoice: (invoiceId) => 
    api.post(BILLING_ENDPOINTS.SEND_INVOICE(invoiceId)),
  markAsPaid: (invoiceId) => 
    api.patch(BILLING_ENDPOINTS.MARK_AS_PAID(invoiceId)),
  downloadInvoice: (invoiceId) => 
    api.get(BILLING_ENDPOINTS.DOWNLOAD_INVOICE(invoiceId), {
      responseType: 'blob',
    }),
    
  // Payment methods
  getPaymentMethods: () => 
    api.get(BILLING_ENDPOINTS.PAYMENT_METHODS),
  addPaymentMethod: (paymentMethodData) => 
    api.post(BILLING_ENDPOINTS.PAYMENT_METHODS, paymentMethodData),
  removePaymentMethod: (paymentMethodId) => 
    api.delete(`${BILLING_ENDPOINTS.PAYMENT_METHODS}/${paymentMethodId}`),
    
  // Subscription
  getSubscription: () => 
    api.get(BILLING_ENDPOINTS.SUBSCRIPTION),
  updateSubscription: (subscriptionData) => 
    api.put(BILLING_ENDPOINTS.SUBSCRIPTION, subscriptionData),
  cancelSubscription: () => 
    api.delete(BILLING_ENDPOINTS.SUBSCRIPTION),
    
  // Usage
  getUsage: (params) => 
    api.get(BILLING_ENDPOINTS.USAGE, { params }),
};

// Notifications API
export const notificationsAPI = {
  // Notification management
  getAll: (params) => 
    api.get(NOTIFICATION_ENDPOINTS.NOTIFICATIONS, { params }),
  getById: (notificationId) => 
    api.get(NOTIFICATION_ENDPOINTS.NOTIFICATION_BY_ID(notificationId)),
  markAsRead: (notificationId) => 
    api.patch(NOTIFICATION_ENDPOINTS.MARK_AS_READ(notificationId)),
  markAllAsRead: () => 
    api.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ),
  delete: (notificationId) => 
    api.delete(NOTIFICATION_ENDPOINTS.NOTIFICATION_BY_ID(notificationId)),
  
  // Preferences
  getPreferences: () => 
    api.get(NOTIFICATION_ENDPOINTS.PREFERENCES),
  updatePreferences: (preferences) => 
    api.put(NOTIFICATION_ENDPOINTS.PREFERENCES, preferences),
  
  // Counts
  getUnreadCount: () => 
    api.get(NOTIFICATION_ENDPOINTS.UNREAD_COUNT),
};

// User API
export const userAPI = {
  // Profile
  getProfile: () => api.get(USER_ENDPOINTS.PROFILE),
  updateProfile: (userData) => 
    api.put(USER_ENDPOINTS.PROFILE, userData),
  
  // Authentication
  changePassword: (passwords) => 
    api.post(USER_ENDPOINTS.CHANGE_PASSWORD, passwords),
  
  // Preferences
  getPreferences: () => 
    api.get(USER_ENDPOINTS.PREFERENCES),
  updatePreferences: (preferences) => 
    api.patch(USER_ENDPOINTS.PREFERENCES, preferences),
  
  // Avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post(USER_ENDPOINTS.AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteAvatar: () => 
    api.delete(USER_ENDPOINTS.AVATAR),
  
  // User management (admin only)
  getAllUsers: (params) => 
    api.get(USER_ENDPOINTS.ALL_USERS, { params }),
  getUserById: (userId) => 
    api.get(USER_ENDPOINTS.USER_BY_ID(userId)),
  createUser: (userData) => 
    api.post(USER_ENDPOINTS.ALL_USERS, userData),
  updateUser: (userId, userData) => 
    api.put(USER_ENDPOINTS.USER_BY_ID(userId), userData),
  deleteUser: (userId) => 
    api.delete(USER_ENDPOINTS.USER_BY_ID(userId)),
  
  // Roles and permissions
  getAvailableRoles: () => 
    api.get(USER_ENDPOINTS.USER_ROLES),
  updateUserRoles: (userId, roles) => 
    api.put(`${USER_ENDPOINTS.USER_BY_ID(userId)}/roles`, { roles }),
};

// Reports API
export const reportsAPI = {
  // Report management
  getAll: (params) => 
    api.get(REPORT_ENDPOINTS.REPORTS, { params }),
  getById: (reportId) => 
    api.get(REPORT_ENDPOINTS.REPORT_BY_ID(reportId)),
  delete: (reportId) => 
    api.delete(REPORT_ENDPOINTS.REPORT_BY_ID(reportId)),
  download: (reportId) => 
    api.get(REPORT_ENDPOINTS.DOWNLOAD_REPORT(reportId), {
      responseType: 'blob',
    }),
  
  // Report generation
  generate: (reportConfig) => 
    api.post(REPORT_ENDPOINTS.GENERATE_REPORT, reportConfig),
  
  // Report types and templates
  getReportTypes: () => 
    api.get(REPORT_ENDPOINTS.REPORT_TYPES),
  getReportTemplate: (reportType) => 
    api.get(`${REPORT_ENDPOINTS.REPORT_TYPES}/${reportType}/template`),
  saveReportTemplate: (reportType, template) => 
    api.put(`${REPORT_ENDPOINTS.REPORT_TYPES}/${reportType}/template`, { template }),
};

export default api;
