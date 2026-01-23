// frontend/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, redirectToLogin } from './middleware/auth';

// Define protected routes
const protectedRoutes = ['/todos', '/dashboard', '/profile'];

export function middleware(request: NextRequest) {
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // If it's a protected route, check if user is authenticated
    const isAuthenticated = authenticateRequest(request);

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      return redirectToLogin(request);
    }
  }

  // Continue to the requested page if authenticated or not a protected route
  return NextResponse.next();
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};