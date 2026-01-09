---
name: Getting Started with Neon - Account Setup and First Connection
description: Set up a Neon account and make your first database connection. Learn the Neon console and basic project configuration. Use when setting up a Neon account, creating projects, connecting to databases, getting connection strings, testing connections with psql, managing roles and passwords, and configuring database access.
---

# Getting Started with Neon - Account Setup and First Connection

## Account Creation

### Sign Up Process
1. Visit https://console.neon.tech/signup
2. Sign up with your email, GitHub, Google, or other partner account
3. Complete the verification process if required

### Initial Project Setup
1. After signing up, you'll be guided through onboarding steps
2. Create a new project in the Neon Console
3. Project is the top-level container that holds your branches, databases, and roles
4. Typically, create one project for each repository in your application
5. The project will include:
   - A `production` branch (default branch, configured with larger compute size 1-4 CU)
   - A `development` branch (child of production, configured with smaller compute size 0.25-1 CU)

## Neon Console Navigation

### Dashboard Overview
- **Dashboard**: Shows your projects and branches
- **Branches**: Manage your database branches
- **SQL Editor**: Run queries directly in the browser
- **Tables**: Visual data management interface powered by Drizzle Studio
- **Settings**: Configure project settings and manage billing

### Project Structure
- **Project**: Top-level container (equivalent to a repository)
- **Branch**: Isolated copy of database data and schema
- **Database**: PostgreSQL database instance
- **Role**: Database user with specific permissions

## Creating Your First Database Connection

### Connection Methods
1. **Dashboard Connection Modal**: Click "Connect" on your Project Dashboard
2. **Connection String**: Copy the connection string for your application
3. **psql**: Use the connection string with psql for command-line access

### Connection String Format
```
postgresql://[user]:[password]@[neon_hostname]/[dbname]?sslmode=require
```

### Pooled vs Direct Connections
- **Direct Connection**: For applications that need persistent connections
- **Pooled Connection**: Add `-pooler` to the endpoint ID to use connection pooling
  - Example: `postgresql://user:pass@ep-cool-darkness-123456-pooler.us-east-2.aws.neon.tech/dbname`

## Connection Steps

### 1. Get Connection String from Neon Console
1. Go to your project dashboard
2. Click "Connect" button
3. Copy the connection string
4. For connection pooling, toggle the "Connection pooling" option

### 2. Connect Using psql
```bash
# Using the connection string directly
psql "postgresql://username:password@endpoint_id.region.aws.neon.tech/dbname?sslmode=require"

# Or set as environment variable
export DATABASE_URL="postgresql://username:password@endpoint_id.region.aws.neon.tech/dbname?sslmode=require"
psql "$DATABASE_URL"
```

### 3. Test Your Connection
Run a simple query to verify the connection:
```sql
SELECT 'hello neon' as greeting;
```

## Role and Password Management

### Default Role
- Neon creates a default role for your database
- The role name and password are provided during project creation
- You can change the password in the Neon Console

### Creating Additional Roles
1. Connect to your database as a superuser
2. Execute SQL commands to create new roles:
```sql
CREATE ROLE new_role_name WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE your_database_name TO new_role_name;
GRANT USAGE ON SCHEMA public TO new_role_name;
```

## Connection Security

### SSL/TLS Encryption
- Neon requires SSL/TLS encryption for all connections
- Use `sslmode=require` parameter in your connection string
- For enhanced security, consider using `sslmode=verify-full`

### Connection Parameters
- `sslmode=require`: Requires SSL encryption
- `sslmode=verify-full`: Requires SSL and verifies server certificate
- `channel_binding=require`: Additional security layer for SCRAM authentication

## Troubleshooting Common Issues

### Connection Timeout
- Ensure your connection string is correct
- Check firewall settings if applicable
- Verify that the compute instance is running (may have scaled to zero)

### Authentication Failure
- Double-check username and password
- Verify the correct database name in the connection string
- Ensure SSL mode is properly configured

### Permission Issues
- Confirm the role has necessary permissions
- Check if the database exists and is accessible
- Verify the role has CONNECT privileges on the database

## Environment Configuration

### Using Environment Variables
Store your connection string in a `.env` file:
```
DATABASE_URL="postgresql://username:password@endpoint_id.region.aws.neon.tech/dbname?sslmode=require"
```

Then load it in your application:
- Python: Use python-dotenv package
- Node.js: Use the built-in process.env
- Other languages: Use appropriate environment variable loading mechanisms

## Best Practices

### Connection Management
- Use connection pooling for applications with many concurrent connections
- Implement proper connection lifecycle management
- Configure appropriate timeout settings
- Use direct connections for operations requiring persistent connections (migrations, etc.)

### Security
- Store credentials securely using environment variables
- Use strong, randomly generated passwords
- Rotate passwords regularly
- Limit role permissions to minimum required access

## Quick Reference
- Sign up at: https://console.neon.tech/signup
- Console URL: https://console.neon.tech/
- Connection string format: `postgresql://user:pass@host/dbname?sslmode=require`
- Pooled connection: Add `-pooler` to endpoint ID
- Test connection: `SELECT 'hello neon';`
- Default branches: production (main) and development (child)