// frontend/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findUserByEmail, updateUserLastLogin } from '../../../../lib/db/users';
import { comparePassword } from '../../../../lib/auth/password';
import { signToken } from '../../../../lib/auth/jwt';

// Zod validation schema for login input
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      // Return generic error to prevent user enumeration
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user.password exists before comparing
    if (!user.password) {
      // Return generic error to prevent user enumeration
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare passwords
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      // Return generic error to prevent user enumeration
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login time
    await updateUserLastLogin(email);

    // Generate JWT token
    const tokenPayload = {
      id: user.id || email, // Use email as ID if no ID exists
      email: user.email,
    };

    const token = signToken(tokenPayload);

    // Create response with JWT in HTTP-only cookie and redirect to todos page
    const response = NextResponse.redirect(new URL('/todos', request.url));

    // Set the JWT in an HTTP-only cookie with security settings
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);

    // Return a generic error to prevent user enumeration
    return Response.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}