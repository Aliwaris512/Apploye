import api from '../../services/api';

const monitoringService = {
  // Get activities with optional filters
  getActivities: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.type) params.append('type', filters.type);
    
    const response = await api.get(`/monitoring/activities?${params.toString()}`);
    return response.data;
  },
  
  // Get screenshots with optional filters
  getScreenshots: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/monitoring/screenshots?${params.toString()}`);
    return response.data;
  },
  
  // Get activity statistics
  getActivityStats: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/monitoring/stats?${params.toString()}`);
    return response.data;
  },
  
  // Get screenshot by ID
  getScreenshot: async (id) => {
    const response = await api.get(`/monitoring/screenshots/${id}`);
    return response.data;
  },
  
  // Get activity timeline for a user
  getActivityTimeline: async (userId, filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/monitoring/users/${userId}/timeline?${params.toString()}`);
    return response.data;
  },
  
  // Get productivity metrics
  getProductivityMetrics: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.granularity) params.append('granularity', filters.granularity);
    
    const response = await api.get(`/monitoring/metrics/productivity?${params.toString()}`);
    return response.data;
  },
  
  // Get application usage
  getApplicationUsage: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/monitoring/metrics/applications?${params.toString()}`);
    return response.data;
  },
  
  // Get website usage
  getWebsiteUsage: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/monitoring/metrics/websites?${params.toString()}`);
    return response.data;
  },
  
  // Get activity summary
  getActivitySummary: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/monitoring/summary?${params.toString()}`);
    return response.data;
  },
};

export default monitoringService;
