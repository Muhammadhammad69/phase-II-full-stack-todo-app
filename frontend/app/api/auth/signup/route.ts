// frontend/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser } from '../../../../lib/db/users';
import { initializeDatabase } from '../../../../lib/db/init';
import { ensureConnection } from '../../../../lib/db/connection';
import { comparePassword } from '../../../../lib/auth/password';

// Zod validation schema for signup input
const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])/, {
      message: 'Password must contain at least one uppercase and one lowercase letter'
    }),
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
      return Response.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();

    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { email, username, password } = validationResult.data;
    console.log("email", email);
    // Attempt to create the user
    const createdUser = await createUser(email, username, password);

    if (!createdUser) {
      // User already exists (caught by unique constraint)
      return Response.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Return success response
    return Response.json(
      {
        success: true,
        message: 'User created successfully',
        user: { email: createdUser.email, username: createdUser.username }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup error:', error);

    // Return a generic error to prevent user enumeration
    return Response.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}