import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);

      if (error.response.status === 401) {
        // Handle unauthorized access
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('Network error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/api/user/profile')
};

// Books endpoints
export const booksAPI = {
  getAll: () => api.get('/books'),
  borrow: (bookId) => api.post('/borrow', { book_id: bookId }),
  return: (bookId) => api.post('/return-book', { book_id: bookId }),
  getBorrowed: () => api.get('/borrowed-books'),
  getHistory: () => api.get('/borrow-history')
};

// Marketplace endpoints
export const marketplaceAPI = {
  getListings: () => api.get('/sell-books'),
  createListing: (bookData) => api.post('/sell-book', bookData),
  requestBook: (id) => api.post('/sell-books/request', { id }),
  buyBook: (bookId) => api.post('/sell-books/buy', { bookId }),
  confirmReceive: (id) => api.post('/sell-books/confirm-receive', { id }),
  cancelRequest: (id) => api.post('/sell-books/cancel-request', { id }),
  deleteListing: (id) => api.delete(`/sell-books/${id}`)
};

// Admin endpoints
export const adminAPI = {
  login: (credentials) => api.post('/api/admin/login', credentials),
  logout: () => api.post('/api/admin/logout'),
  getProfile: () => api.get('/api/admin/me'),
  getBorrowedBooks: () => api.get('/api/admin/borrowed-books'),
  getExpiredBooks: () => api.get('/api/admin/expired-books'),
  addBook: (bookData) => api.post('/api/admin/add-book', bookData)
};

export default api;