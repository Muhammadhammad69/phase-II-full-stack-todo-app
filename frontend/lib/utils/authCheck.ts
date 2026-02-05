// frontend/lib/utils/authCheck.ts

import { cookieUtils } from './cookieUtils';

/**
 * Check if user is authenticated and redirect to login if not
 * This function can be called in client-side components to verify authentication
 * @param redirectPath Path to redirect to if not authenticated (defaults to /login)
 * @returns True if authenticated, false if redirected
 */
export const checkAuthAndRedirect = async (redirectPath: string = '/login'): Promise<boolean> => {
  return await cookieUtils.checkAuthAndRedirect(redirectPath);
};

/**
 * Verify if the auth token exists and is valid
 * @returns True if token exists and is valid, false otherwise
 */
export const isAuthenticated = async (): Promise<boolean> => {
  return await cookieUtils.verifyAuthToken();
};

/**
 * Get the auth token from cookies
 * @returns The auth token if it exists, null otherwise
 */
export const getAuthToken = (): string | null => {
  return cookieUtils.getAuthToken();
};