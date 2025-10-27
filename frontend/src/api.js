import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management utilities
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  removeTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token && !tokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken && !tokenManager.isTokenExpired(refreshToken)) {
        try {
          const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          tokenManager.setToken(access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          tokenManager.removeTokens();
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No valid refresh token, redirect to login
        tokenManager.removeTokens();
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API endpoints
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/registration/', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login/', credentials),
  
  // Logout user
  logout: () => api.post('/auth/logout/'),
  
  // Get user profile
  getUser: () => api.get('/auth/user/'),
  
  // Update user profile
  updateUser: (userData) => api.patch('/auth/user/', userData),
  
  // Change password
  changePassword: (passwordData) => api.post('/auth/password/change/', passwordData),
  
  // Request password reset
  requestPasswordReset: (email) => api.post('/auth/password/reset/', { email }),
  
  // Confirm password reset
  confirmPasswordReset: (resetData) => api.post('/auth/password/reset/confirm/', resetData),
  
  // Refresh token
  refreshToken: (refreshToken) => api.post('/auth/token/refresh/', { refresh: refreshToken }),
  
  // Verify token
  verifyToken: (token) => api.post('/auth/token/verify/', { token }),
};

// Helper function to handle authentication
export const handleAuthResponse = (response) => {
  const { access, refresh, user } = response.data;
  
  if (access) {
    tokenManager.setToken(access);
  }
  
  if (refresh) {
    tokenManager.setRefreshToken(refresh);
  }
  
  return { access, refresh, user };
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = tokenManager.getToken();
  return token && !tokenManager.isTokenExpired(token);
};

export default api;