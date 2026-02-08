// frontend/src/lib/constants/apiConstants.ts

/**
 * API Constants for Frontend-Backend Integration
 */

// Base URL configuration
export const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  // Health check
  HEALTH: '/health',

  // Task management (using proxy routes for BFF pattern)
  TASKS: {
    BASE: '/api/proxy/tasks',
    SINGLE: (id: string) => `/api/proxy/tasks/${id}`,
    COMPLETE: (id: string) => `/api/proxy/tasks/${id}`, // PATCH to this endpoint handles completion
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/api/v1/dashboard/stats',
  },
} as const;

// Default headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Retry configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000, // 1 second
  BACKOFF_MULTIPLIER: 2,
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 20,
  DEFAULT_PAGE: 1,
} as const;