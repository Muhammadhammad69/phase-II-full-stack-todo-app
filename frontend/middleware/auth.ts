// frontend/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../lib/auth/jwt';

export const authenticateRequest = async (request: NextRequest): Promise<boolean> => {
  // Get the auth token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return false;
  }

  // Verify the JWT token
  const decoded = await verifyToken(token);

  return decoded !== null;
};

export const redirectToLogin = (request: NextRequest): NextResponse => {
  // Redirect to login page
  const url = request.nextUrl.clone();
  
  url.pathname = '/login';
  url.search = `?return=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
};

export const redirectToTodos = (request: NextRequest): NextResponse => {
  // Redirect to todos page
  const url = request.nextUrl.clone();
  url.pathname = '/todos';
  url.search = `?return=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}