// frontend/lib/db/users.ts
import { Pool } from 'pg';
import { hashPassword } from '../auth/password';
import { User } from '../../types/auth';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Create a new user in the database
 * @param email - User's email address
 * @param username - User's username
 * @param password - Plain text password (will be hashed)
 * @returns Created user object or null if user already exists
 */
export const createUser = async (
  email: string,
  username: string,
  password: string
): Promise<Pick<User, 'email' | 'username'> | null> => {
  try {
    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert the new user into the database
    const query = `
      INSERT INTO users (email, username, password, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING email, username
    `;

    const result = await pool.query(query, [email, username, hashedPassword]);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    return null;
  } catch (error: any) {
    // Check if the error is due to duplicate email
    if (error.code === '23505') { // PostgreSQL unique violation code
      return null;
    }
    throw error;
  }
};

/**
 * Find a user by email
 * @param email - User's email address
 * @returns User object or null if not found
 */
export const findUserByEmail = async (
  email: string
): Promise<User | null> => {
  try {
    const query = 'SELECT email, username, password FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    return null;
  } catch (error) {
    console.error('Database query error:', error);
    return null;
  }
};

/**
 * Update user's last login timestamp
 * @param email - User's email address
 */
export const updateUserLastLogin = async (email: string): Promise<void> => {
  try {
    const query = 'UPDATE users SET updated_at = NOW() WHERE email = $1';
    await pool.query(query, [email]);
  } catch (error) {
    console.error('Error updating user login time:', error);
  }
};