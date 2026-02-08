// frontend/src/lib/utils/cookieUtils.ts

/**
 * Utility functions for handling cookies in the browser
 */
import { verifyToken } from '../auth/jwt';

export const cookieUtils = {
  /**
   * Get a cookie value by name
   */
  getCookie(name: string): string | null {
    if (typeof document === 'undefined') {
      return null; // Not available in server-side rendering
    }

    const matches = document.cookie.match(
      new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '$1')}=([^;]*)`)
    );
    return matches ? decodeURIComponent(matches[1]) : null;
  },


  /**
   * Delete a cookie by name
   */
  deleteCookie(name: string, path: string = '/', domain?: string): void {
    if (typeof document === 'undefined') {
      return; // Not available in server-side rendering
    }

    let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    if (path) {
      cookieString += `; path=${path}`;
    }

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  },

  /**
   * Get the JWT token from cookies
   */
  getAuthToken(): string | null {
    return this.getCookie('auth_token'); // Only return the custom auth token, not the better-auth token
  },

  /**
   * Remove authentication tokens from cookies
   */
  clearAuthTokens(): void {
    this.deleteCookie('auth_token');
  },

  /**
   * Verify the auth token exists and is valid
   * @returns True if token exists and is valid, false otherwise
   */
  async verifyAuthToken(): Promise<boolean> {
    const token = this.getAuthToken();

    if (!token) {
      return false;
    }

    try {
      const decoded = await verifyToken(token);
      return decoded !== null;
    } catch (error) {
      console.error('Error verifying auth token:', error);
      return false;
    }
  },

  /**
   * Check if user is authenticated and redirect to login if not
   * @param redirectPath Path to redirect to if not authenticated (defaults to /login)
   * @returns True if authenticated, false if redirected
   */
  async checkAuthAndRedirect(redirectPath: string = '/login'): Promise<boolean> {
    const isAuthenticated = await this.verifyAuthToken();

    if (!isAuthenticated) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = redirectPath;
      }
      return false;
    }

    return true;
  }
};