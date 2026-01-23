// frontend/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser } from '../../../../lib/db/users';
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

export async function POST(request: NextRequest) {
  try {
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

    // Create response and redirect to login page
    const response = new NextResponse(null, {
      status: 302,
      headers: {
        Location: '/login', // Redirect to login page after successful signup
      },
    });

    return response;

  } catch (error: any) {
    console.error('Signup error:', error);

    // Return a generic error to prevent user enumeration
    return Response.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}