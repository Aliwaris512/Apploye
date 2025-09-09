import api from './api';

export const payrollService = {
  // Calculate payroll
  calculatePayroll: async (userId, startDate, endDate) => {
    const response = await api.get('/api/v1/payroll/calculate', {
      params: {
        user_id: userId,
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  },
  
  // Get payroll history
  getPayrollHistory: async (userId, year = null, month = null) => {
    const params = { user_id: userId };
    if (year) params.year = year;
    if (month) params.month = month;
    
    const response = await api.get('/api/v1/payroll/history', { params });
    return response.data;
  },
  
  // Generate payroll report
  generatePayrollReport: async (userIds, startDate, endDate) => {
    const response = await api.post('/api/v1/payroll/report', {
      user_ids: Array.isArray(userIds) ? userIds : [userIds],
      start_date: startDate,
      end_date: endDate
    });
    return response.data;
  },
  
  // Update payroll settings (admin only)
  updatePayrollSettings: async (settings) => {
    const response = await api.put('/api/v1/payroll/settings', settings);
    return response.data;
  },
  
  // Get payroll settings
  getPayrollSettings: async () => {
    const response = await api.get('/api/v1/payroll/settings');
    return response.data;
  },
  
  // Export payroll to CSV/PDF
  exportPayroll: async (payrollId, format = 'pdf') => {
    const response = await api.get(`/api/v1/payroll/export/${payrollId}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
};
