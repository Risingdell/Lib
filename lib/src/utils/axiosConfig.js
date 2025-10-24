import axios from 'axios';
import { getToken, getAdminToken, removeToken, removeAdminToken } from './authToken';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Setup Axios interceptors for JWT authentication
 * This automatically adds the Authorization header to all requests
 */
export function setupAxiosInterceptors() {
  // Request interceptor - Add JWT token to headers
  axios.interceptors.request.use(
    (config) => {
      // Determine if this is an admin request
      const isAdminRequest = config.url?.includes('/api/admin') || config.url?.includes('/admin');

      // Get appropriate token
      const token = isAdminRequest ? getAdminToken() : getToken();

      // Add token to Authorization header if available
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Ensure credentials are included for session fallback
      config.withCredentials = true;

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle token expiration
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response) {
        const { status, data } = error.response;

        // Handle 401 Unauthorized (expired or invalid token)
        if (status === 401) {
          const message = data?.message || '';

          // Check if it's a token expiration issue
          if (
            message.includes('expired') ||
            message.includes('Invalid token') ||
            message.includes('No token')
          ) {
            // Determine if it was an admin request
            const isAdminRequest = error.config?.url?.includes('/api/admin') ||
                                  error.config?.url?.includes('/admin');

            if (isAdminRequest) {
              removeAdminToken();
              // Redirect to admin login
              if (window.location.pathname !== '/admin-login') {
                window.location.href = '/admin-login';
              }
            } else {
              removeToken();
              // Redirect to user login
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }
          }
        }

        // Handle 403 Forbidden
        if (status === 403) {
          console.error('Access forbidden:', data?.message);
        }
      }

      return Promise.reject(error);
    }
  );

  console.log('✅ Axios interceptors configured for JWT authentication');
}

/**
 * Create axios instance with base URL
 */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Setup interceptors for the custom axios instance
 */
api.interceptors.request.use(
  (config) => {
    const isAdminRequest = config.url?.includes('/api/admin') || config.url?.includes('/admin');
    const token = isAdminRequest ? getAdminToken() : getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminRequest = error.config?.url?.includes('/api/admin');

      if (isAdminRequest) {
        removeAdminToken();
        if (window.location.pathname !== '/admin-login') {
          window.location.href = '/admin-login';
        }
      } else {
        removeToken();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
