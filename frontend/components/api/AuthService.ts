// frontend/src/components/api/AuthService.ts

import { cookieUtils } from '../../lib/utils/cookieUtils';

export interface JwtPayload {
  user_id: string;
  email: string;
  exp: number;
  iat: number;
}

export interface AuthTokens {
  jwt_token: string;
  refresh_token?: string;
  expires_at: string; // ISO date string
  user_id: string;
}

class AuthService {
  private static readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Check if the current JWT token is valid and not expired
   */
  static isTokenValid(token?: string | null): boolean {
    if (!token) {
      token = cookieUtils.getAuthToken();
    }

    if (!token) {
      return false;
    }

    try {
      // Remove 'Bearer ' prefix if present
      const tokenWithoutPrefix = token.startsWith('Bearer ')
        ? token.substring(7)
        : token;

      // Decode the token (without verifying signature)
      const payloadBase64 = tokenWithoutPrefix.split('.')[1];
      if (!payloadBase64) {
        return false;
      }

      // Add padding if needed
      const paddedPayload = payloadBase64.padEnd(
        payloadBase64.length + (4 - (payloadBase64.length % 4)) % 4,
        '='
      );

      const decodedPayload = atob(paddedPayload);
      const payload: JwtPayload = JSON.parse(decodedPayload);

      // Check if token is expired
      const currentTime = Date.now() / 1000; // Convert to seconds
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  /**
   * Check if the token is close to expiration and needs refresh
   */
  static isTokenExpiringSoon(token?: string | null): boolean {
    if (!token) {
      token = cookieUtils.getAuthToken();
    }

    if (!token) {
      return true; // If no token, it needs refresh
    }

    try {
      // Remove 'Bearer ' prefix if present
      const tokenWithoutPrefix = token.startsWith('Bearer ')
        ? token.substring(7)
        : token;

      // Decode the token (without verifying signature)
      const payloadBase64 = tokenWithoutPrefix.split('.')[1];
      if (!payloadBase64) {
        return true;
      }

      // Add padding if needed
      const paddedPayload = payloadBase64.padEnd(
        payloadBase64.length + (4 - (payloadBase64.length % 4)) % 4,
        '='
      );

      const decodedPayload = atob(paddedPayload);
      const payload: JwtPayload = JSON.parse(decodedPayload);

      // Check if token will expire within the threshold
      const currentTime = Date.now() / 1000; // Convert to seconds
      const timeUntilExpiration = (payload.exp - currentTime) * 1000; // Convert back to milliseconds

      return timeUntilExpiration <= this.TOKEN_REFRESH_THRESHOLD;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // If there's an error, assume token needs refresh
    }
  }

  /**
   * Get the current auth token
   */
  static getCurrentToken(): string | undefined {
    const token = cookieUtils.getAuthToken();
    return token ?? undefined;
  }

  /**
   * Store auth tokens in cookies
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static storeTokens(tokens: AuthTokens): void {
    // This method is deprecated as tokens should only be set via login route
    // The auth_token cookie is set server-side during login for security
    console.warn('AuthService.storeTokens is deprecated. Tokens should only be set via login route.');
  }

  /**
   * Clear all auth tokens
   */
  static clearTokens(): void {
    cookieUtils.clearAuthTokens();
  }

  /**
   * Refresh the JWT token if it's close to expiration
   */
  async refreshToken(): Promise<boolean> {
    // For now, we'll just return true if the current token is still valid
    // In a real implementation, this would call a refresh endpoint
    const currentToken = AuthService.getCurrentToken();

    if (!currentToken) {
      return false;
    }

    // If token is not expiring soon, no need to refresh
    if (!AuthService.isTokenExpiringSoon(currentToken)) {
      return true;
    }

    // In a real implementation, we would call the backend refresh endpoint
    // For now, we'll just return false to indicate that a new login is needed
    console.warn('Token needs refresh, but refresh endpoint not implemented yet');
    return false;
  }

  /**
   * Validate the current session by making an authenticated request
   */
  async validateSession(): Promise<boolean> {
    try {
      // We could make a call to a user profile endpoint to validate the session
      // For now, just check if the token is valid
      const token = AuthService.getCurrentToken();
      return AuthService.isTokenValid(token);
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
export { AuthService };