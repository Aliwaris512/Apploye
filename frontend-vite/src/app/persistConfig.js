import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  // Add any reducers you want to persist
  whitelist: ['auth'], // Only persist the auth reducer
  // Add any reducers you want to blacklist
  // blacklist: ['navigation'],
};

export default persistConfig;
