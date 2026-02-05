import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL

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
    const tokenVerify = await verifyToken(token);

    if(!tokenVerify) {
      return NextResponse.json(
        { message: 'Invalid token: Please log in again', success: false },
        { status: 401 }
      );
    }


    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams();

    // Add all query parameters from the original request
    for (const [key, value] of searchParams) {
      queryParams.append(key, value);
    }

    // Construct backend URL with query parameters
    const backendUrl = `${BACKEND_BASE_URL}/api/v1/tasks/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    // Forward request to backend with Authorization header
    
    const backendResponse = await fetch(backendUrl, {
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
    console.error('Proxy tasks GET error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Get request body
    const body = await request.json();
    
    // Forward request to backend with Authorization header
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/api/v1/tasks/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    console.error('Proxy tasks POST error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}