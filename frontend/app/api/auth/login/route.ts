// frontend/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { success, z } from 'zod';
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
    const tokenPayload = {
      id: user.id || "", // UUID of the user
      email: user.email,
    };

    const token = signToken(tokenPayload);

    // Create response with JWT in HTTP-only cookie and redirect to todos page
    // const response = NextResponse.redirect(new URL('/todos', request.url));
    const response = NextResponse.json(
      {
        message: 'Login successful',
        success: true
      }, 
      { 
        status: 200 
      }
    );

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