import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';

// Reducers
import authReducer from '../features/auth/authSlice.jsx';
import projectReducer from '../features/projects/projectSlice';
import taskReducer from '../features/tasks/taskSlice';
import timesheetReducer from '../features/timesheet/timesheetSlice';
import payrollReducer from '../features/payroll/payrollSlice';
import activityReducer from '../features/activity/activitySlice';
import timeTrackingReducer from '../features/timeTracking/timeTrackingSlice';

// Persist config
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  // Only persist the auth reducer
  whitelist: ['auth'],
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  projects: projectReducer,
  tasks: taskReducer,
  timesheet: timesheetReducer,
  payroll: payrollReducer,
  activity: activityReducer,
  timeTracking: timeTrackingReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'activity/uploadScreenshot/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload.startDate', 'payload.endDate', 'payload.date', 'payload.startTime', 'payload.endTime'],
        // Ignore these paths in the state
        ignoredPaths: [
          'timesheet.dateRange.startDate', 
          'timesheet.dateRange.endDate', 
          'activity.dateRange', 
          'activity.screenshots',
          'timeTracking.items',
          'timeTracking.currentEntry'
        ]
      }
    }),
});

// Create persistor
export const persistor = persistStore(store);

export default { store, persistor };
