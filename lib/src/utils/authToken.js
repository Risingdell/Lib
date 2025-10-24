/**
 * Authentication Token Utilities for JWT-based authentication
 * This provides a better solution for iOS/Safari cross-origin issues
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_KEY = 'admin_data';

/**
 * Save user authentication token
 */
export function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
}

/**
 * Get user authentication token
 */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

/**
 * Remove user authentication token
 */
export function removeToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
}

/**
 * Save user data
 */
export function saveUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
}

/**
 * Get user data
 */
export function getUser() {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Save admin authentication token
 */
export function saveAdminToken(token) {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving admin token:', error);
  }
}

/**
 * Get admin authentication token
 */
export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting admin token:', error);
    return null;
  }
}

/**
 * Remove admin authentication token
 */
export function removeAdminToken() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  } catch (error) {
    console.error('Error removing admin token:', error);
  }
}

/**
 * Save admin data
 */
export function saveAdmin(admin) {
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  } catch (error) {
    console.error('Error saving admin:', error);
  }
}

/**
 * Get admin data
 */
export function getAdmin() {
  try {
    const adminData = localStorage.getItem(ADMIN_KEY);
    return adminData ? JSON.parse(adminData) : null;
  } catch (error) {
    console.error('Error getting admin:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  const token = getToken();
  return !!token;
}

/**
 * Check if admin is authenticated
 */
export function isAdminAuthenticated() {
  const token = getAdminToken();
  return !!token;
}

/**
 * Clear all authentication data
 */
export function clearAuth() {
  removeToken();
  removeAdminToken();
}

/**
 * Decode JWT token (without verification - use only for reading payload)
 */
export function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token) {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token) {
  try {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
}
