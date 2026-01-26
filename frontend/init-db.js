#!/usr/bin/env node

// Script to initialize the database tables
const { Client } = require('pg');

async function runInitialization() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();

    console.log('Initializing database...');

    // Create users table if it doesn't exist
    const createTableQuery = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4(),
        email VARCHAR(255) PRIMARY KEY NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create updated_at trigger function if it doesn't exist
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create trigger to update updated_at column
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.triggers
                         WHERE event_object_table = 'users'
                         AND trigger_name = 'update_users_updated_at') THEN
              CREATE TRIGGER update_users_updated_at
              BEFORE UPDATE ON users
              FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
          END IF;
      END $$;
    `;

    await client.query(createTableQuery);
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runInitialization();