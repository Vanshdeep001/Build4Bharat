import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pmddky_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pmddky_token');
      localStorage.removeItem('pmddky_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
