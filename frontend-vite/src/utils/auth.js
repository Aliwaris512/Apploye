// Token management
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    // Set default auth header for axios
    if (window.axios) {
      window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  } else {
    removeAuthToken();
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  if (window.axios) {
    delete window.axios.defaults.headers.common['Authorization'];
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

// Get user info from token
export const getUserFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      exp: payload.exp
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

// Role-based access control
export const hasRole = (requiredRole) => {
  const user = getUserFromToken();
  if (!user) return false;
  
  // If no specific role required, just check if user is authenticated
  if (!requiredRole) return true;
  
  // Check if user has the required role
  return user.role === requiredRole;
};

export const hasAnyRole = (roles = []) => {
  if (!Array.isArray(roles) || roles.length === 0) return true;
  
  const user = getUserFromToken();
  if (!user) return false;
  
  return roles.includes(user.role);
};

// Redirect if not authenticated
export const requireAuth = (to, from, next) => {
  if (!isAuthenticated()) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  } else {
    next();
  }
};

// Redirect if user doesn't have required role
export const requireRole = (role) => {
  return (to, from, next) => {
    if (!isAuthenticated()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else if (!hasRole(role)) {
      next({ path: '/unauthorized' });
    } else {
      next();
    }
  };
};
