// frontend/src/components/api/ApiService.ts

import { BACKEND_BASE_URL, API_ENDPOINTS, DEFAULT_HEADERS, REQUEST_TIMEOUT } from '../../lib/constants/apiConstants';
import { cookieUtils } from '../../lib/utils/cookieUtils';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an API request with authentication and error handling
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions & RequestInit = {}
  ): Promise<T> {
    const { headers = {}, timeout = REQUEST_TIMEOUT, ...fetchOptions } = options;

    // Determine if this is a proxy request
    const isProxyRequest = endpoint.includes('/api/proxy/');

    const url = endpoint.startsWith('/api/') ? endpoint : this.baseUrl + endpoint;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      ...(DEFAULT_HEADERS as Record<string, string>),
      ...(headers as Record<string, string>),
    };

    // For non-proxy requests, add Authorization header with the auth token
    // For proxy requests, authentication happens via cookies which are sent automatically
    // when credentials: 'include' is set (handled below)
    const authToken = cookieUtils.getAuthToken();
    if (!isProxyRequest && authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // For proxy requests, include credentials so cookies are sent
    const fetchConfig: RequestInit = {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
    };

    if (isProxyRequest) {
      fetchConfig.credentials = 'include'; // This ensures cookies are sent with the request
    }

    try {
      const response = await fetch(url, fetchConfig);

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized - likely token expired
      if (response.status === 401) {
        // For proxy requests, the error message comes from the proxy
        // For direct requests, we use the generic message
        if (isProxyRequest) {
          try {
            const errorData = await response.json();
            if (errorData.message) {
              throw new Error(errorData.message);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            // If parsing fails, use generic error message
          }
        }
        throw new Error('Unauthorized: Please log in again');
      }

      // Check if response is ok
      if (!response.ok) {
        // Try to parse error response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = typeof errorData.detail === 'string'
              ? errorData.detail
              : JSON.stringify(errorData.detail);
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // If parsing fails, use generic error message
        }

        throw new Error(errorMessage);
      }

      // For successful responses, return the parsed JSON
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if ((error as Error).name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  /**
   * GET request helper
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request helper
   */
  async post<T, R = T>(
    endpoint: string,
    data?: T,
    options: RequestOptions = {}
  ): Promise<R> {
    return this.request<R>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request helper
   */
  async put<T, R = T>(
    endpoint: string,
    data: T,
    options: RequestOptions = {}
  ): Promise<R> {
    return this.request<R>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request helper
   */
  async patch<T, R = T>(
    endpoint: string,
    data: T,
    options: RequestOptions = {}
  ): Promise<R> {
    return this.request<R>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request helper
   */
  async delete<T = void>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Check if the API is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get(API_ENDPOINTS.HEALTH);
      return response ? true : false;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Create a singleton instance of ApiService
export const apiService = new ApiService();