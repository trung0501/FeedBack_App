
import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

/**
 * Base API URL - Change this to your backend URL
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Create Axios instance
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

/**
 * Request Interceptor - Add auth token to every request
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle errors globally
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // TODO: Implement refresh token logic if your backend supports it
          // const response = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh: refreshToken });
          // localStorage.setItem('access_token', response.data.access);
          // originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          // return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Forbidden: You do not have permission to access this resource');
    }

    if (error.response?.status === 404) {
      console.error('Not Found: The requested resource does not exist');
    }

    if (error.response?.status === 500) {
      console.error('Server Error: Something went wrong on the server');
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'An unexpected error occurred';
};

export default api;