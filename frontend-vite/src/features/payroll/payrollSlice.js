import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { payrollService } from '../../api/payrollService';

// Async thunks
export const calculatePayroll = createAsyncThunk(
  'payroll/calculate',
  async ({ userId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await payrollService.calculatePayroll(userId, startDate, endDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to calculate payroll');
    }
  }
);

export const fetchPayrollHistory = createAsyncThunk(
  'payroll/fetchHistory',
  async ({ userId, year, month }, { rejectWithValue }) => {
    try {
      const response = await payrollService.getPayrollHistory(userId, year, month);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch payroll history');
    }
  }
);

export const generatePayrollReport = createAsyncThunk(
  'payroll/generateReport',
  async ({ userIds, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await payrollService.generatePayrollReport(userIds, startDate, endDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate payroll report');
    }
  }
);

const payrollSlice = createSlice({
  name: 'payroll',
  initialState: {
    currentPayroll: null,
    history: [],
    loading: false,
    error: null,
    report: null,
    filters: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      status: 'all'
    }
  },
  reducers: {
    setPayrollFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearPayrollError: (state) => {
      state.error = null;
    },
    clearPayrollReport: (state) => {
      state.report = null;
    }
  },
  extraReducers: (builder) => {
    // Calculate Payroll
    builder.addCase(calculatePayroll.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(calculatePayroll.fulfilled, (state, action) => {
      state.loading = false;
      state.currentPayroll = action.payload;
    });
    builder.addCase(calculatePayroll.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Payroll History
    builder.addCase(fetchPayrollHistory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPayrollHistory.fulfilled, (state, action) => {
      state.loading = false;
      state.history = action.payload;
    });
    builder.addCase(fetchPayrollHistory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Generate Payroll Report
    builder.addCase(generatePayrollReport.fulfilled, (state, action) => {
      state.report = action.payload;
    });
  }
});

export const { 
  setPayrollFilters, 
  clearPayrollError, 
  clearPayrollReport 
} = payrollSlice.actions;

export const selectCurrentPayroll = (state) => state.payroll.currentPayroll;
export const selectPayrollHistory = (state) => state.payroll.history;
export const selectPayrollLoading = (state) => state.payroll.loading;
export const selectPayrollError = (state) => state.payroll.error;
export const selectPayrollReport = (state) => state.payroll.report;
export const selectPayrollFilters = (state) => state.payroll.filters;

export default payrollSlice.reducer;
