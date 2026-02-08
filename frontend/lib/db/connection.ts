// frontend/lib/db/connection.ts
import { pool } from './init';

/**
 * Test database connection
 * @returns Promise<boolean> - True if connection is successful
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    // Run a simple query to test the connection
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

/**
 * Ensure database is connected before performing operations
 * @returns Promise<boolean> - True if connected successfully
 */
export const ensureConnection = async (): Promise<boolean> => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Database is not connected');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error ensuring database connection:', error);
    return false;
  }
};