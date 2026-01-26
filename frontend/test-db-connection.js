#!/usr/bin/env node

// Test script to verify database connection functionality
require('dotenv').config();

const { testConnection, ensureConnection } = require('./lib/db/connection');

async function runTests() {
  console.log('Testing database connection functionality...\n');

  try {
    // Test 1: Basic connection test
    console.log('Test 1: Testing basic database connection...');
    const isConnected = await testConnection();
    console.log(`✓ Connection test result: ${isConnected ? 'SUCCESS' : 'FAILED'}\n`);

    // Test 2: Ensure connection function
    console.log('Test 2: Testing ensureConnection function...');
    const ensuredConnection = await ensureConnection();
    console.log(`✓ Ensure connection result: ${ensuredConnection ? 'SUCCESS' : 'FAILED'}\n`);

    if (isConnected && ensuredConnection) {
      console.log('🎉 All database connection tests PASSED!');
      console.log('Both /api/auth/signup and /api/auth/login routes will now check database connectivity before processing requests.');
    } else {
      console.error('❌ Some database connection tests FAILED!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during database connection tests:', error.message);
    process.exit(1);
  }
}

runTests();