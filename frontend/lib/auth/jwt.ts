import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  email: string;
}

/**
 * Sign a JWT token
 * @param payload - Data to include in the token
 * @returns Signed JWT token
 */
export const signToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET_KEY!;
  const expiresIn = '7d'; // 7 days as specified in the requirements

  return jwt.sign(payload, secret, {
    algorithm: process.env.JWT_ALGORITHM as jwt.Algorithm || 'HS256',
    expiresIn
  });
};

/**
 * Verify a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const secret = process.env.JWT_SECRET_KEY!;
    const decoded = jwt.verify(token, secret, {
      algorithms: [process.env.JWT_ALGORITHM as jwt.Algorithm || 'HS256']
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};