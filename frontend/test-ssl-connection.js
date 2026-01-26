#!/usr/bin/env node

// Simple test script to verify database connection with SSL
require('dotenv').config();

const { Pool } = require('pg');

console.log('Testing database connection with SSL configuration...');

// Create a pool with the same configuration as in init.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
});

async function testConnection() {
  try {
    console.log('Attempting to connect to the database...');

    // Test the connection
    const result = await pool.query('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    console.log('Test query result:', result.rows[0]);

    // Test table creation capability
    console.log('\nTesting if we can create a test table...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS test_ssl_connection (
        id SERIAL PRIMARY KEY,
        test_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);
    console.log('✅ Table creation successful!');

    // Clean up - drop the test table
    await pool.query('DROP TABLE IF EXISTS test_ssl_connection;');
    console.log('✅ Cleanup successful!');

    await pool.end();
    console.log('\n🎉 All tests passed! Your SSL database configuration is working correctly.');
    console.log('The signup API should now work without the SSL error.');
  } catch (error) {
    console.error('❌ Error testing database connection:', error.message);
    console.error('Full error details:', error);
    await pool.end();
    process.exit(1);
  }
}

testConnection();