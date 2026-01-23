---
name: Database Configuration
description: When setting up databases for authentication, configuring database schemas, managing database migrations, or optimizing database performance for authentication systems
version: 1.0.0
---

# Database Configuration Guide for Better-Auth

## PostgreSQL Setup

### Installation and Configuration
- Install PostgreSQL server (version 12 or higher recommended)
- Create a dedicated database for your application
- Create a database user with appropriate permissions
- Configure connection pooling if needed

### Connection Configuration
```javascript
import { betterAuth } from "better-auth";
import { postgresAdapter } from "@better-auth/postgres-adapter";
import { drizzle } from "drizzle-orm/postgresql-core";

const db = drizzle(/* your pg client */);

const auth = betterAuth({
  database: postgresAdapter(db, {
    provider: "pg",
  }),
  // other options
});
```

### Environment Variables
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
DATABASE_URL=postgresql://username:password@host:port/database
```

### Schema Considerations
- Ensure proper indexing on frequently queried fields (email, userId)
- Consider partitioning for large-scale applications
- Implement proper foreign key relationships
- Plan for horizontal scaling if needed

### Performance Optimization
- Use connection pooling (pg-pool or similar)
- Implement proper indexing strategies
- Monitor slow queries
- Consider read replicas for read-heavy operations

## MySQL Setup

### Installation and Configuration
- Install MySQL server (version 8.0 or higher recommended)
- Create a dedicated database for your application
- Create a database user with appropriate permissions
- Configure connection pooling if needed

### Connection Configuration
```javascript
import { betterAuth } from "better-auth";
import { mysqlAdapter } from "@better-auth/mysql-adapter";
import { drizzle } from "drizzle-orm/mysql-core";

const db = drizzle(/* your mysql client */);

const auth = betterAuth({
  database: mysqlAdapter(db, {
    provider: "mysql",
  }),
  // other options
});
```

### Environment Variables
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
DATABASE_URL=mysql://username:password@host:port/database
```

### Schema Considerations
- Use InnoDB engine for transaction support
- Ensure proper indexing on frequently queried fields
- Consider partitioning for large-scale applications
- Implement proper foreign key relationships

### Performance Optimization
- Use connection pooling (mysql2 or similar)
- Implement proper indexing strategies
- Monitor slow queries with slow query log
- Consider read replicas for read-heavy operations

## SQLite Setup

### Installation and Configuration
- Install SQLite (usually comes with most systems)
- Create a database file in a writable location
- Ensure proper file permissions
- Consider WAL mode for better concurrency

### Connection Configuration
```javascript
import { betterAuth } from "better-auth";
import { sqliteAdapter } from "@better-auth/sqlite-adapter";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlite = new SQLite("sqlite.db");
const db = drizzle(sqlite);

const auth = betterAuth({
  database: sqliteAdapter(db, {
    provider: "sqlite",
  }),
  // other options
});
```

### Environment Variables
```
SQLITE_PATH=./sqlite.db
DATABASE_URL=file:./sqlite.db
```

### Schema Considerations
- Use WAL mode for better concurrency
- Consider file locking mechanisms
- Plan for backup strategies
- Monitor file size growth

### Performance Optimization
- Use WAL mode for concurrent reads/writes
- Implement proper indexing
- Consider connection reuse
- Monitor disk space usage

## MongoDB Setup

### Installation and Configuration
- Install MongoDB server (version 5.0 or higher recommended)
- Create a dedicated database for your application
- Create a database user with appropriate permissions
- Configure connection pooling if needed

### Connection Configuration
```javascript
import { betterAuth } from "better-auth";
import { mongoDBAdapter } from "@better-auth/mongodb-adapter";

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();

const auth = betterAuth({
  database: mongoDBAdapter(db),
  // other options
});
```

### Environment Variables
```
MONGODB_URI=mongodb://username:password@host:port/database
MONGODB_DB_NAME=your_database
```

### Schema Considerations
- Design document structure for authentication data
- Implement proper indexing strategies
- Consider embedding vs referencing related data
- Plan for document size limitations

### Performance Optimization
- Use connection pooling
- Implement proper indexing
- Monitor query performance
- Consider sharding for large datasets

## Database Migration Strategies

### Schema Versioning
- Implement version tracking for database schema
- Use migration files with sequential numbering
- Include rollback capabilities in migrations
- Test migrations on copies of production data

### Migration Tools
#### Drizzle Kit
```bash
npm install -D drizzle-kit
```

Create a drizzle.config.ts:
```typescript
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // or 'mysql', 'sqlite'
});
```

Generate migrations:
```bash
npx drizzle-kit generate
```

Apply migrations:
```bash
npx drizzle-kit migrate
```

### Zero-Downtime Migrations
- Implement backward-compatible schema changes
- Use blue-green deployment strategies
- Test migrations thoroughly in staging
- Prepare rollback procedures

## Security Considerations

### Connection Security
- Use encrypted connections (SSL/TLS) when possible
- Validate certificates if using SSL
- Store connection strings securely
- Implement proper firewall rules

### Data Encryption
- Encrypt sensitive data at rest if required
- Use field-level encryption for highly sensitive data
- Implement proper key management
- Consider transparent data encryption (TDE) if supported

### Access Controls
- Use dedicated database users for applications
- Implement principle of least privilege
- Monitor database access logs
- Implement proper audit trails

## Performance Monitoring

### Key Metrics to Monitor
- Query response times
- Connection pool utilization
- Slow query frequency
- Database CPU and memory usage
- Disk I/O patterns

### Indexing Strategies
- Index frequently queried fields (email, userId, sessionToken)
- Consider composite indexes for multi-field queries
- Monitor index usage and effectiveness
- Remove unused indexes to reduce write overhead

## Backup and Recovery

### Backup Strategies
- Regular automated backups
- Point-in-time recovery capabilities
- Off-site backup storage
- Test restore procedures regularly

### Disaster Recovery
- Define recovery time objectives (RTO)
- Define recovery point objectives (RPO)
- Document recovery procedures
- Regular disaster recovery testing

## Database Scaling

### Vertical Scaling
- Increase server resources (CPU, RAM, disk)
- Optimize database configuration
- Implement proper indexing
- Monitor performance metrics

### Horizontal Scaling
- Consider read replicas for read-heavy workloads
- Implement database sharding if needed
- Use connection pooling effectively
- Monitor cross-shard query performance