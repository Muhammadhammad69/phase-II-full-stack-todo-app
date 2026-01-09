---
name: Connection Pooling in Neon - Optimizing Connections
description: Master Neon's connection pooling for optimal database performance. Learn when and how to use pooled vs direct connections, configure connection pooling, choose appropriate pool sizes, handle transaction isolation levels, monitor connection pool usage, and troubleshoot connection issues. Use when optimizing database connections, choosing between pooled and direct connections, configuring connection pooling settings, handling transaction isolation, monitoring connection usage, troubleshooting connection issues, and optimizing performance for different application types.
---

# Connection Pooling in Neon - Optimizing Connections

## Understanding Connection Pooling

### What is Connection Pooling
Connection pooling is a technique that maintains a pool of database connections that can be reused by multiple requests. Neon uses PgBouncer, an open-source connection pooler for PostgreSQL, to support connection pooling and enable up to 10,000 concurrent connections.

### Why Connection Pooling Matters
- **Resource Efficiency**: Reduces the overhead of creating new connections
- **Performance**: Faster connection acquisition compared to establishing new connections
- **Scalability**: Handle more concurrent requests without hitting connection limits
- **Cost Management**: Reduce the need for larger compute instances due to connection limits

## Connection Types in Neon

### Direct Connections
- **When to Use**: Single-process applications, long-lived connections, schema migrations, logical replication
- **Characteristics**: Direct connection to the PostgreSQL instance
- **Connection String**: Uses the standard endpoint without `-pooler`
- **Use Cases**:
  - Schema migrations
  - Administrative tasks
  - Applications with few concurrent connections
  - Applications requiring session-level features

### Pooled Connections
- **When to Use**: Serverless functions, multiple processes, web servers, applications with many concurrent connections
- **Characteristics**: Connections routed through PgBouncer connection pooler
- **Connection String**: Includes `-pooler` in the endpoint ID
- **Use Cases**:
  - Serverless applications
  - Multi-threaded applications
  - High-traffic web applications
  - Applications with many short-lived connections

## PgBouncer Configuration in Neon

### Default Configuration
```ini
[pgbouncer]
pool_mode=transaction
max_client_conn=10000
default_pool_size=0.9 * max_connections
max_prepared_statements=1000
query_wait_timeout=120
```

### Pool Modes
- **Transaction Mode** (`pool_mode=transaction`): Connection is assigned to a client during a transaction and returned to the pool when the transaction completes
- **Session Mode**: Connection remains assigned to a client for the entire session
- **Statement Mode**: Connection is returned to the pool after each statement

### Key Settings
- **max_client_conn**: Maximum number of client connections allowed (10,000)
- **default_pool_size**: Number of server connections per user/database pair (0.9 * max_connections)
- **max_prepared_statements**: Maximum number of prepared statements (1000)
- **query_wait_timeout**: Maximum time queries wait for execution (120 seconds)

## Connection Pooling in Different Applications

### Serverless Functions
```python
# Serverless function with connection pooling
import psycopg2
import os

def lambda_handler(event, context):
    # Use pooled connection string for serverless
    conn_string = os.environ['NEON_POOLED_CONNECTION_STRING']

    conn = psycopg2.connect(conn_string)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE id = %s", (event['user_id'],))
            result = cur.fetchone()
        return {'statusCode': 200, 'body': str(result)}
    finally:
        conn.close()
```

### Node.js Web Server
```javascript
// Using pg with connection pooling
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.NEON_POOLED_CONNECTION_STRING,
  max: 20, // Maximum number of clients in the pool
  min: 5,  // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

module.exports = pool;
```

### Python with SQLAlchemy
```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# Use pooled connection string with SQLAlchemy
engine = create_engine(
    os.environ['NEON_POOLED_CONNECTION_STRING'],
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600    # Recycle connections after 1 hour
)
```

## Transaction Mode Limitations

### Features Not Supported in Transaction Mode
- `SET`/`RESET` statements (session variables are not preserved)
- `LISTEN`/`NOTIFY` (asynchronous notifications)
- `WITH HOLD CURSOR` (held cursors)
- `PREPARE`/`DEALLOCATE` (prepared statements at session level)
- `TEMP` tables (temporary tables)
- `LOAD` statements
- Session-level advisory locks

### Workarounds for Transaction Mode
- Use `ALTER ROLE role_name SET setting_name TO value;` to set persistent session variables
- For `search_path`, use schema prefixes in queries or set it via role configuration
- Use application-level alternatives for unsupported features

## Performance Optimization

### Choosing Pool Size
- **Small Applications**: 5-10 connections
- **Medium Applications**: 10-50 connections
- **Large Applications**: 50-100+ connections
- **Serverless**: Use default pool settings

### Connection Lifecycle Management
- **Connection Timeout**: Set appropriate timeout values to avoid hanging connections
- **Idle Connection Handling**: Configure idle timeouts to return connections to the pool
- **Connection Validation**: Use `pool_pre_ping` (SQLAlchemy) or connection validation queries

### Monitoring Pool Performance
- Watch for `query_wait_timeout` errors indicating pool saturation
- Monitor connection pool utilization
- Track query response times during peak usage

## Connection Pooling with ORMs

### Prisma with Neon
```javascript
// Prisma schema with pooled connection
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("NEON_POOLED_DATABASE_URL")  // Use pooled connection string
}
```

### Django with Neon
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'your-pooler-endpoint.neon.tech',  # Use pooler endpoint
        'PORT': '5432',
        'OPTIONS': {
            'MAX_CONN_AGE': 600,  # Recycle connections after 10 minutes
        },
    }
}
```

## Troubleshooting Connection Pooling

### Common Issues

#### "Too Many Connections" Errors
- **Cause**: Exceeding PostgreSQL's `max_connections` limit
- **Solution**: Use connection pooling or reduce connection pool sizes

#### Pool Saturation
- **Cause**: Too many concurrent requests exceeding pool capacity
- **Solution**: Increase pool size or optimize query performance

#### Session Variable Loss
- **Cause**: Using transaction mode where session variables are not preserved
- **Solution**: Use role-level settings or schema prefixes

#### Connection Timeout Issues
- **Cause**: Long-running queries blocking connection pool
- **Solution**: Optimize queries or increase timeout settings

### Diagnostic Queries
```sql
-- Check current connections
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE datname = 'your_database_name';

-- Check for connection issues
SELECT usename, application_name, state, query_start
FROM pg_stat_activity
WHERE state = 'active';
```

## Monitoring Connection Pool Usage

### Neon Console Metrics
- **Connection Count**: Monitor active and total connections
- **Pool Utilization**: Track how much of the pool is being used
- **Query Performance**: Monitor for slow queries affecting pool performance
- **Error Rates**: Track connection-related errors

### Application-Level Monitoring
- Log connection pool metrics
- Monitor query execution times
- Track connection acquisition times
- Alert on pool exhaustion

## Best Practices

### When to Use Pooled Connections
- **High-Concurrency Applications**: Applications with many concurrent users
- **Serverless Functions**: To handle variable connection demands
- **Microservices**: Multiple services sharing database resources
- **Load-Balanced Applications**: Multiple application instances

### When to Use Direct Connections
- **Schema Migrations**: Tools that may not support pooled connections
- **Long-Running Transactions**: Operations requiring persistent connections
- **Administrative Tasks**: Database maintenance operations
- **Logical Replication**: Requires persistent connections

### Pool Configuration Guidelines
- Start with conservative pool sizes and scale up as needed
- Use `pool_pre_ping` for serverless applications to handle compute restarts
- Implement circuit breakers to handle database outages gracefully
- Monitor and log pool performance metrics

### Connection Management
- Always close connections properly
- Use context managers/try-finally blocks for connection handling
- Implement retry logic for transient connection failures
- Set appropriate timeout values for your application needs

## Quick Reference

### Connection String Formats
- **Direct**: `postgresql://user:pass@ep-endpoint.region.neon.tech/dbname?sslmode=require`
- **Pooled**: `postgresql://user:pass@ep-endpoint-pooler.region.neon.tech/dbname?sslmode=require`

### Pool Size Recommendations
- **Development**: 5-10 connections
- **Staging**: 10-20 connections
- **Production Small**: 20-50 connections
- **Production Large**: 50+ connections

### Key Settings to Remember
- `pool_pre_ping=True`: Verify connections before use (SQLAlchemy)
- `pool_recycle=3600`: Recycle connections after 1 hour
- `connection_timeout=2000`: Timeout after 2 seconds (in ms)
- `idle_timeout=30000`: Close idle connections after 30 seconds (in ms)

### Common Troubleshooting Commands
```bash
# Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'your_db';

# Find long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```