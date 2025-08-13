import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import activityReducer from '../features/activity/activitySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    activity: activityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
