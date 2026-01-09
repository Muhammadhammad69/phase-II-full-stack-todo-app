---
name: Authentication and Security in Neon - Protecting Your Database
description: Secure your Neon database with proper authentication, role management, and access control. Learn security best practices, role-based access control (RBAC), permissions management, secret handling, IP whitelisting, and audit trails. Use when implementing database security, creating and managing database roles, setting strong passwords, implementing RBAC, restricting permissions, handling secrets securely, configuring IP whitelisting, and auditing access.
---

# Authentication and Security in Neon - Protecting Your Database

## Role-Based Access Control (RBAC)

### Understanding Roles in PostgreSQL/Neon
- **Superuser Roles**: Have all privileges and can bypass all permission checks
- **Regular Roles**: Have specific permissions granted to them
- **Login Roles**: Can connect to the database (similar to users)
- **Group Roles**: Collections of roles that can be granted to other roles

### Creating Application Roles
```sql
-- Create a new application role
CREATE ROLE app_user WITH LOGIN PASSWORD 'strong_random_password';

-- Create role with specific privileges
CREATE ROLE readonly_user WITH LOGIN PASSWORD 'another_secure_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;

-- Create admin role
CREATE ROLE admin_user WITH LOGIN PASSWORD 'admin_password' SUPERUSER CREATEDB CREATEROLE;
```

### Setting Strong Passwords
- Use randomly generated passwords with sufficient entropy
- Rotate passwords regularly (monthly or quarterly)
- Store passwords securely using environment variables or secret managers
- Never commit passwords to source code repositories

```sql
-- Change password for a role
ALTER ROLE app_user PASSWORD 'new_strong_password';

-- Use a password from an environment variable or secret manager
ALTER ROLE app_user PASSWORD 'complex_password_from_secrets';
```

## Granting and Revoking Permissions

### Connection Permissions
```sql
-- Grant connection permission to a database
GRANT CONNECT ON DATABASE your_database_name TO app_user;

-- Revoke connection permission
REVOKE CONNECT ON DATABASE your_database_name FROM app_user;
```

### Schema Permissions
```sql
-- Grant usage permission on schema
GRANT USAGE ON SCHEMA public TO app_user;

-- Grant schema creation permission
GRANT CREATE ON SCHEMA public TO admin_user;
```

### Table-Level Permissions
```sql
-- Grant specific permissions on tables
GRANT SELECT, INSERT, UPDATE ON TABLE users TO app_user;
GRANT ALL PRIVILEGES ON TABLE admin_settings TO admin_user;

-- Grant permissions on all tables in schema
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Grant permissions on sequences
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

### Column-Level Permissions
```sql
-- Grant permissions on specific columns
GRANT SELECT (id, username, email) ON TABLE users TO readonly_user;
GRANT UPDATE (last_login, failed_attempts) ON TABLE users TO auth_service;
```

## Principle of Least Privilege

### Role-Specific Permissions
- **Application Roles**: Only grant necessary permissions for application operations
- **Read-Only Roles**: Limited to SELECT operations
- **Reporting Roles**: Access only to reporting tables/views
- **Admin Roles**: Full permissions but limited access

### Example Role Configurations
```sql
-- Web application role
CREATE ROLE web_app_user WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE myapp TO web_app_user;
GRANT USAGE ON SCHEMA public TO web_app_user;
GRANT SELECT, INSERT, UPDATE ON TABLE users TO web_app_user;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO web_app_user;

-- Reporting role
CREATE ROLE reporting_user WITH LOGIN PASSWORD 'reporting_password';
GRANT CONNECT ON DATABASE myapp TO reporting_user;
GRANT USAGE ON SCHEMA public TO reporting_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporting_user;

-- Data analyst role (with specific table access)
CREATE ROLE analyst_user WITH LOGIN PASSWORD 'analyst_password';
GRANT CONNECT ON DATABASE myapp TO analyst_user;
GRANT USAGE ON SCHEMA public TO analyst_user;
GRANT SELECT ON TABLE users, orders, products TO analyst_user;
```

## Connection Security

### SSL/TLS Encryption
Neon requires SSL/TLS encryption for all connections. Configure your connection string with appropriate SSL mode:

```python
# Python example with psycopg2
import psycopg2

# Recommended: verify-full mode
conn = psycopg2.connect(
    host="ep-cool-darkness-123456.us-east-2.aws.neon.tech",
    database="myapp",
    user="app_user",
    password="password",
    sslmode="verify-full",  # Verify server certificate completely
    sslrootcert="/path/to/ca-certificate.crt"  # System root cert path
)

# Alternative: require mode (encryption required but less verification)
conn = psycopg2.connect(
    # ... other params ...
    sslmode="require"  # Requires SSL but doesn't verify server identity
)
```

### Connection String Security
```javascript
// Node.js example
const { Pool } = require('pg');

const pool = new Pool({
  // Use environment variable for connection string
  connectionString: process.env.DATABASE_URL,
  // Additional security options
  ssl: {
    rejectUnauthorized: true  // Reject unauthorized certificates
  }
});
```

### Channel Binding (Enhanced Security)
```python
# Enhanced security with channel binding
conn_string = "postgresql://user:pass@host/db?sslmode=require&channel_binding=require"
```

## Secret Management

### Environment Variables
```bash
# .env file (never commit to version control)
DATABASE_URL="postgresql://app_user:complex_password@ep-host.region.neon.tech/myapp?sslmode=require"
```

```python
# Python with python-dotenv
from dotenv import load_dotenv
import os

load_dotenv()

database_url = os.getenv('DATABASE_URL')
```

### Using Secret Managers
```python
# AWS Secrets Manager example
import boto3
import json

def get_secret(secret_name, region_name):
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    get_secret_value_response = client.get_secret_value(SecretId=secret_name)
    secret = json.loads(get_secret_value_response['SecretString'])
    return secret

# Use the secret
db_creds = get_secret("prod/neon-db-credentials", "us-east-1")
```

### API Token Security
- Store Neon API tokens securely
- Use different tokens for different environments
- Rotate tokens regularly
- Limit token permissions to minimum required scope

## IP Whitelisting and Network Security

### Configuring IP Allow Lists
Neon provides IP allow list functionality to restrict database access to specific IP addresses:

1. In the Neon Console, navigate to Settings
2. Go to the "IP Allow" section
3. Add specific IP addresses or ranges that should have access
4. Save the configuration

### Private Networking
- Use Neon's private networking features when available
- Connect to Neon from VPCs or private networks
- Implement additional network-level security

## Audit and Access Logging

### Connection Logging
Monitor connection attempts and user activities:

```sql
-- Check active connections
SELECT usename, application_name, client_addr, backend_start, state
FROM pg_stat_activity
WHERE datname = 'your_database_name';

-- View connection logs (if logging is enabled)
-- Note: Neon provides monitoring through its console
```

### Role Activity Monitoring
```sql
-- Monitor role creation and modification
SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolvaliduntil
FROM pg_roles
WHERE rolname NOT LIKE 'pg_%';  -- Exclude system roles
```

### Query Logging (Neon Console)
- Neon provides query logs through its console
- Monitor for unusual or potentially harmful queries
- Set up alerts for specific patterns

## Security Best Practices

### Password Policies
- Use strong, randomly generated passwords
- Implement password rotation policies
- Use different passwords for different environments
- Never reuse passwords across applications

### Role Management
- Create separate roles for different application components
- Use role inheritance to manage permissions efficiently
- Regularly audit role permissions
- Remove unused roles promptly

### Session Security
- Implement proper session management in applications
- Use connection timeouts to limit session duration
- Monitor for long-running sessions that may indicate issues

### Data Protection
- Encrypt sensitive data at rest when possible
- Use column-level encryption for highly sensitive data
- Implement proper access controls to prevent unauthorized data access

## Common Security Misconfigurations to Avoid

### Overly Permissive Roles
```sql
-- DON'T: Grant all privileges to all users
GRANT ALL PRIVILEGES ON DATABASE myapp TO app_user;  -- Avoid this

-- DO: Grant only necessary permissions
GRANT CONNECT ON DATABASE myapp TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON TABLE users TO app_user;
```

### Weak Passwords
```sql
-- DON'T: Use weak passwords
CREATE ROLE app_user WITH LOGIN PASSWORD 'password123';  -- Very bad

-- DO: Use strong, randomly generated passwords
CREATE ROLE app_user WITH LOGIN PASSWORD 'Gk9#mP2$xN7!vQ4&wR8*';
```

### Unrestricted Access
```sql
-- DON'T: Allow access from any IP without proper controls
-- Avoid opening database to all IPs without proper authentication

-- DO: Implement proper access controls
-- Use IP allow lists, strong authentication, and role-based access
```

## Security Monitoring

### Regular Audits
- Review role permissions regularly
- Check for unused accounts
- Verify SSL/TLS configurations
- Monitor connection patterns for anomalies

### Alerting
- Set up alerts for failed connection attempts
- Monitor for unusual query patterns
- Alert on role creation/modification
- Track changes to permissions

## Compliance Considerations

### GDPR Compliance
- Implement proper data access logging
- Ensure data subject rights can be exercised
- Use appropriate access controls for personal data
- Document data processing activities

### SOC 2 Compliance
- Implement proper access controls and monitoring
- Maintain audit logs
- Regular security assessments
- Document security procedures

### HIPAA Compliance
- Use appropriate encryption
- Implement access controls
- Maintain audit logs
- Follow security best practices

## Quick Security Checklist

### Before Going Live
- [ ] Created separate roles for different application components
- [ ] Implemented principle of least privilege
- [ ] Used strong, randomly generated passwords
- [ ] Configured SSL/TLS encryption
- [ ] Stored credentials securely (not in source code)
- [ ] Set up connection pooling appropriately
- [ ] Configured IP allow lists if needed
- [ ] Tested connection security settings
- [ ] Documented role responsibilities
- [ ] Planned for regular security reviews

### Regular Maintenance
- [ ] Rotate passwords regularly
- [ ] Audit role permissions periodically
- [ ] Review connection logs for anomalies
- [ ] Update security configurations as needed
- [ ] Review and update access controls
- [ ] Monitor for security advisories

## Quick Reference

### Common Security Commands
```sql
-- List all roles and their properties
SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolcanlogin FROM pg_roles;

-- Show permissions for a specific table
\d+ table_name

-- Grant permissions pattern
GRANT {privilege_type} ON {object_type} {object_name} TO {role};

-- Revoke permissions pattern
REVOKE {privilege_type} ON {object_type} {object_name} FROM {role};
```

### Connection Security Settings
- `sslmode=require`: Require SSL encryption
- `sslmode=verify-full`: Require SSL and verify server identity
- `channel_binding=require`: Additional security layer
- Use environment variables for credentials
- Implement connection timeouts
- Use connection pooling for security and performance