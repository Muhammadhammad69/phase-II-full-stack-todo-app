// frontend/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser } from '../../../../lib/db/users';
import { initializeDatabase } from '../../../../lib/db/init';
import { ensureConnection } from '../../../../lib/db/connection';


// Zod validation schema for signup input
const signupSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
 password: z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ),
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
          success: false
        },
        { status: 500 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();

    const validationResult = signupSchema.safeParse(body);
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

    const { email, username, password } = validationResult.data;
    console.log("email", email);
    // Attempt to create the user
    const createdUser = await createUser(email, username, password);

    if (!createdUser) {
      // User already exists (caught by unique constraint)
      return NextResponse.json(
        { 
          message: 'Email already exists',
          success: false 
        },
        { 
          status: 409 
        }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please log in.'
      },
      { 
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Signup error:', error);

    // Return a generic error to prevent user enumeration
    return NextResponse.json(
      { 
        message: 'An error occurred during signup',
        success: false 
      },
      { 
        status: 500 
      }
    );
  }
}