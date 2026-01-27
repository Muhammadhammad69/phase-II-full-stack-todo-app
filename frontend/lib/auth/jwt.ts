import { SignJWT, jwtVerify } from 'jose';

interface JWTPayload {
  id: string;
  email: string;
}

/**
 * Sign a JWT token
 * @param payload - Data to include in the token
 * @returns Signed JWT token
 */
export const signToken = async (payload: JWTPayload): Promise<string> => {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET_KEY || 'default_secret_key_for_development'
  );
  const alg = process.env.JWT_ALGORITHM || 'HS256';
  const expiresIn = '7d'; // 7 days as specified in the requirements

  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
};

/**
 * Verify a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET_KEY || 'default_secret_key_for_development'
    );

    const verified = await jwtVerify(token, secret);
    return verified.payload as JWTPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};