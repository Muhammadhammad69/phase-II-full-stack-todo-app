import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const rawToken = request.cookies.get('auth_token')?.value;
    const token = rawToken ? decodeURIComponent(rawToken) : null;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated', success: false },
        { status: 401 }
      );
    }

    // Forward request to backend health check with Authorization header
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      // If backend returns 401, the token might be invalid on backend side too
      if (backendResponse.status === 401) {
        return NextResponse.json(
          { message: 'Unauthorized: Please log in again', success: false },
          { status: 401 }
        );
      }

      // Forward other error responses from backend
      const errorBody = await backendResponse.text();
      try {
        return NextResponse.json(JSON.parse(errorBody), { status: backendResponse.status });
      } catch {
        return NextResponse.json(
          { message: errorBody || 'Backend request failed', success: false },
          { status: backendResponse.status }
        );
      }
    }

    // Return successful response from backend
    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('Proxy health check error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}