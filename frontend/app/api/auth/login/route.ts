// frontend/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {  z } from 'zod';
import { findUserByEmail, updateUserLastLogin } from '../../../../lib/db/users';
import { initializeDatabase } from '../../../../lib/db/init';
import { ensureConnection } from '../../../../lib/db/connection';
import { comparePassword } from '../../../../lib/auth/password';
import { signToken } from '../../../../lib/auth/jwt';

// Zod validation schema for login input
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

let dbInitialized = false;


export async function POST(request: NextRequest) {
  try {
    // Initialize database if not already done
    if (!dbInitialized) {
      await initializeDatabase();
      dbInitialized = true;
    }

    // Check database connection
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return NextResponse.json(
        { 
          message: 'Database connection failed', 
          success: false, 
          status: 500 
        },
        { 
          status: 500 
        }
      );
    }

    // Parse and validate the request body
    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Invalid data',
          success: false
        },
        { 
          status: 400 
        }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      // Return generic error to prevent user enumeration
      return NextResponse.json(
        { 
          message: 'Invalid email or password',
          success: false
        },
        { 
          status: 401 
        }
      );
    }

    // Check if user.password exists before comparing
    if (!user.password) {
      // Return generic error to prevent user enumeration
      return NextResponse.json(
        { 
          message: 'Invalid email or password',
          success: false
        },
        { 
          status: 401 
        }
      );
    }

    // Compare passwords
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      // Return generic error to prevent user enumeration
      return NextResponse.json(
        { 
          message: 'Invalid email or password',
          success: false
        },
        { 
          status: 401 
        }
      );
    }

    // Update last login time
    await updateUserLastLogin(email);

    // Generate JWT token
    const userPayload = {
      id: user.id || "", // UUID of the user
      email: user.email,
      name: user.name || "user", // Username of the user,
      createdAt: user.createdAt ? user.createdAt : null,
      updatedAt: user.updatedAt ? user.updatedAt : null,
    };
    
    const token = await signToken(userPayload);

    // Create response with JWT in HTTP-only cookie and redirect to todos page
    // const response = NextResponse.redirect(new URL('/todos', request.url));
    const response = NextResponse.json(
      {
        message: 'Login successfully',
        success: true,
        user: userPayload
      },
      {
        status: 200
      }
    );

    // Set the JWT in a cookie that can be accessed by both client and server
    // Note: This means the token is accessible to client-side JavaScript, which is less secure than HttpOnly
    // but necessary for client-side authentication checks
    response.cookies.set('auth_token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;

  } catch (error: unknown) {
    console.error('Login error:', error);

    // Return a generic error to prevent user enumeration
    return NextResponse.json(
      { 
        message: 'An error occurred during login', 
        success: false
      },
      { 
        status: 500 
      }
    );
  }
}