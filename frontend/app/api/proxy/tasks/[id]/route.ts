import { NextRequest, NextResponse } from 'next/server';
import {verifyToken} from "@/lib/auth/jwt"
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;

// Dynamic route handler for individual tasks
export async function GET(request: NextRequest, {
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    // Get the id from params
    const {id} = await params;

    // Get the auth token from cookies
    const rawToken = request.cookies.get('auth_token')?.value;
    const token = rawToken ? decodeURIComponent(rawToken) : null;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated', success: false },
        { status: 401 }
      );
    }
    // Forward request to backend with Authorization header
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/api/v1/tasks/${id}`, {
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
    console.error('Proxy single task GET error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, {
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    // Get the id from params
    const {id} = await params;

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
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/api/v1/tasks/${id}`, {
      method: 'PUT',
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
    console.error('Proxy single task PUT error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, {
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    // Get the id from params
    const {id} = await params;
    // Get the auth token from cookies
    const rawToken = request.cookies.get('auth_token')?.value;
    const token = rawToken ? decodeURIComponent(rawToken) : null;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated', success: false },
        { status: 401 }
      );
    }

    // Forward request to backend with Authorization header
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/api/v1/tasks/${id}`, {
      method: 'DELETE',
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
    console.error('Proxy single task DELETE error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, {
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    // Get the id from params
    const {id} = await params;
    
    // Get the auth token from cookies
    const rawToken = request.cookies.get('auth_token')?.value;
   
    const token = rawToken ? decodeURIComponent(rawToken) : null;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated', success: false },
        { status: 401 }
      );
    }
    
    await verifyToken(token)
    
    
    
    // Get request body
    // const body = await request.json();

    // Forward request to backend with Authorization header
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/api/v1/tasks/${id}/complete`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify(body),
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
    console.error('Proxy task complete PATCH error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}