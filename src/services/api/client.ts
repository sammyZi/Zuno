/**
 * API Client
 * Axios instance with interceptors for JioSaavn API
 */

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';
import type { ApiError } from '../../types/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Log request in development
    if (__DEV__) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (__DEV__) {
      console.log(`[API Response] ${response.config.url}`, response.status);
    }
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle errors
    if (__DEV__) {
      console.error('[API Response Error]', error.message);
    }

    // Network error
    if (!error.response) {
      const networkError: ApiError = {
        status: 'error',
        message: 'Unable to connect to music service. Please check your internet connection.',
        error: error.message,
      };
      return Promise.reject(networkError);
    }

    // Server error
    const serverError: ApiError = {
      status: error.response.data?.status || 'error',
      message:
        error.response.data?.message ||
        'An error occurred while fetching data. Please try again.',
      error: error.response.data?.error || error.message,
    };

    return Promise.reject(serverError);
  }
);

export default apiClient;
