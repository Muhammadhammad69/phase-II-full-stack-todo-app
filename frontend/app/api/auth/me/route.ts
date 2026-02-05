// frontend/app/api/auth/me/route.ts
import { NextRequest } from 'next/server';
import { verifyToken } from '../../../../lib/auth/jwt';


export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'Not authenticated', user: null }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT token
    const decoded = await verifyToken(token);

    if (decoded) {
      // Return user information
      const user = {
        email: decoded.email,
        id: decoded.id,
        name: decoded.name,
        createdAt: decoded.createdAt ? new Date(decoded.createdAt) : undefined,
        updatedAt: decoded.updatedAt ? new Date(decoded.updatedAt) : undefined,
      };

      return new Response(
        JSON.stringify({ message: 'Authenticated', user }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ message: 'Invalid token', user: null }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: unknown) {
    console.error('Auth status check error:', error);

    return new Response(
      JSON.stringify({ message: 'Authentication error', user: null }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}