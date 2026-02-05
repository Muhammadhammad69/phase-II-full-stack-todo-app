// frontend/proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, redirectToLogin, redirectToTodos } from './middleware/auth';


// Define protected routes
const protectedRoutes = ['/todos', '/dashboard', "/profile"];
const authRoutes = ['/login', '/signup'];

export async function proxy(request: NextRequest) {
   const { pathname } = request.nextUrl;
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );
  // check if user is authenticated
  const isAuthenticated = await authenticateRequest(request);
  
  
  if (isProtectedRoute && !isAuthenticated) {
    // If it's a protected route

      // Redirect to login if not authenticated
    return redirectToLogin(request);
  }

  if(isAuthRoute && isAuthenticated) {
    // If it's an auth route and user is already authenticated, redirect to todos
    return redirectToTodos(request);
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