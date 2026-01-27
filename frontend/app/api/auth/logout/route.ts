// frontend/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      message: 'Logout successful',
      success: true
    });

    // Remove the auth_token cookie by setting it to expired
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Setting maxAge to 0 expires the cookie immediately
    });

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        message: 'An error occurred during logout',
        success: false
      },
      {
        status: 500
      }
    );
  }
}