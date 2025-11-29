/**
 * API Service
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_URL, STORAGE_KEYS, ERROR_MESSAGES } from '@/constants/api';
import { storage } from '@/utils/storage';
import { ApiResponse } from '@/types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to headers
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get token from storage
      const token = await storage.get<string>(STORAGE_KEYS.TOKEN);
      
      if (token && token.trim() !== '') {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Remove Authorization header if no token
        delete config.headers.Authorization;
      }
      
      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const errorData = error.response.data as any;
      const requestUrl = error.config?.url || '';
      
      // Kiểm tra nếu là login request - trả về message từ server
      if (requestUrl.includes('/login') || requestUrl.includes('/auth')) {
        return Promise.reject({
          message: errorData?.message || 'Email hoặc mật khẩu không chính xác',
          status: 401,
          shouldLogout: false,
        });
      }
      
      // Các request khác - token expired
      return Promise.reject({
        message: ERROR_MESSAGES.UNAUTHORIZED,
        status: 401,
        shouldLogout: true,
      });
    }
    
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK_ERROR,
        status: 0,
      });
    }
    
    // Handle server errors (500, 502, etc.)
    if (error.response.status >= 500) {
      return Promise.reject({
        message: ERROR_MESSAGES.SERVER_ERROR,
        status: error.response.status,
      });
    }
    
    // Handle validation errors (400, 422)
    if (error.response.status === 400 || error.response.status === 422) {
      const errorData = error.response.data as any;
      return Promise.reject({
        message: errorData?.message || ERROR_MESSAGES.VALIDATION_ERROR,
        errors: errorData?.errors,
        status: error.response.status,
      });
    }
    
    // Default error
    return Promise.reject({
      message: error.response.data || ERROR_MESSAGES.SERVER_ERROR,
      status: error.response.status,
    });
  }
);

// API methods
export const api = {
  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Export both api and apiClient
export { apiClient };
export default api;

