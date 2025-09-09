import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';

// Import your reducers here
import authReducer from '../features/auth/authSlice';
import notificationReducer from '../features/notifications/notificationsSlice';
import projectReducer from '../features/projects/projectSlice';
import taskReducer from '../features/tasks/taskSlice';
import uiReducer from '../features/ui/uiSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationReducer,
  projects: projectReducer,
  tasks: taskReducer,
  ui: uiReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(thunk),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
const persistor = persistStore(store);

export { store, persistor };
