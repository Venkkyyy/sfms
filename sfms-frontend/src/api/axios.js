import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sfms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sfms_token');
      localStorage.removeItem('sfms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
