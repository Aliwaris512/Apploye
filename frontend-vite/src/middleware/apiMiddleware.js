import { toast } from 'react-toastify';
import { logout } from '../features/auth/authSlice.jsx';
import { clearNotifications } from '../features/notifications/notificationsSlice';

const apiMiddleware = (store) => (next) => async (action) => {
  // Handle API call actions
  if (action.type.endsWith('/pending')) {
    // You can dispatch loading state here if needed
    const loadingAction = {
      type: action.type.replace('/pending', '/loading'),
      payload: true,
    };
    store.dispatch(loadingAction);
  }

  // Handle API success responses
  if (action.type.endsWith('/fulfilled')) {
    // Turn off loading state
    const loadingAction = {
      type: action.type.replace('/fulfilled', '/loading'),
      payload: false,
    };
    store.dispatch(loadingAction);

    // Show success message if available
    if (action.meta?.arg?.successMessage) {
      toast.success(action.meta.arg.successMessage);
    }
  }

  // Handle API errors
  if (action.type.endsWith('/rejected')) {
    // Turn off loading state
    const loadingAction = {
      type: action.type.replace('/rejected', '/loading'),
      payload: false,
    };
    store.dispatch(loadingAction);

    // Handle 401 Unauthorized
    if (action.payload?.status === 401) {
      // Dispatch logout action
      store.dispatch(logout());
      store.dispatch(clearNotifications());
      // Redirect to login page
      window.location.href = '/login';
      return;
    }

    // Show error message
    const errorMessage = 
      action.payload?.data?.message || 
      action.error?.message || 
      'An error occurred. Please try again.';
    
    toast.error(errorMessage);
  }

  return next(action);
};

export default apiMiddleware;
