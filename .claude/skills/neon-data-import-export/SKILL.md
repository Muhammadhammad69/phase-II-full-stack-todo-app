---
name: Data Import and Export in Neon - Data Management
description: Move data in and out of Neon databases. Learn import/export techniques for migrations, backups, and data management. Use when importing data from various sources, exporting data for backups, migrating from other databases, bulk loading data, managing large datasets, using pg_dump/pg_restore, importing from CSV, handling data validation, and optimizing import/export performance.
---

# Data Import and Export in Neon - Data Management

## Understanding Data Movement in Neon

### Neon's Data Architecture
- **Storage Layer**: Persistent storage using cloud object storage (S3)
- **Compute Layer**: Temporary compute instances that access storage
- **Compute Restart Behavior**: When compute restarts, data persists in storage
- **Import/Export Considerations**: Need to account for compute lifecycle during large operations

### When to Import Data
- Migrating from existing PostgreSQL databases
- Loading seed data for new applications
- Restoring from backups
- Populating test/development environments
- Integrating with external data sources

### When to Export Data
- Creating backups before schema changes
- Migrating to different databases
- Creating snapshots for development
- Extracting data for analysis
- Compliance and audit requirements

## Exporting Data from Existing Databases

### Using pg_dump for Full Database Export
```bash
# Export entire database
pg_dump "postgresql://user:password@host:port/database_name" > backup.sql

# Export with specific options for Neon compatibility
pg_dump \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --exclude-table-data '^(schema_migrations)$' \
  "postgresql://user:password@host:port/database_name" > neon_compatible_backup.sql

# Export specific tables only
pg_dump \
  --table='users' \
  --table='orders' \
  "postgresql://user:password@host:port/database_name" > specific_tables.sql

# Export schema only
pg_dump \
  --schema-only \
  "postgresql://user:password@host:port/database_name" > schema_only.sql

# Export with compression
pg_dump \
  --format=custom \
  --compress=9 \
  "postgresql://user:password@host:port/database_name" > compressed_backup.dump
```

### Exporting from Different Database Systems
```bash
# From AWS RDS
pg_dump \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  "postgresql://rds_user:rds_password@rds_endpoint:5432/rds_db" > rds_export.sql

# From Heroku PostgreSQL
heroku pg:backups:capture --app your-app-name
heroku pg:backups:url --app your-app-name
# Download the URL and then import to Neon

# From Google Cloud SQL
pg_dump \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  "postgresql://user:password@cloud_sql_ip:5432/database_name" > cloud_sql_export.sql
```

## Importing Data into Neon

### Using psql for SQL File Imports
```bash
# Import using psql with Neon connection string
psql "postgresql://user:password@ep-endpoint.region.neon.tech/dbname?sslmode=require" < backup.sql

# Import with connection pooling (recommended for large imports)
psql "postgresql://user:password@ep-endpoint-pooler.region.neon.tech/dbname?sslmode=require" < backup.sql

# Import with verbose output and error handling
psql \
  --echo-all \
  --single-transaction \
  --set ON_ERROR_STOP=on \
  "postgresql://user:password@ep-endpoint.region.neon.tech/dbname?sslmode=require" < backup.sql
```

### Using pg_restore for Custom Format Dumps
```bash
# Restore from custom format dump
pg_restore \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --single-transaction \
  --exit-on-error \
  --dbname="postgresql://user:password@ep-endpoint.region.neon.tech/dbname?sslmode=require" \
  compressed_backup.dump

# Restore specific tables from dump
pg_restore \
  --table='users' \
  --table='orders' \
  --dbname="postgresql://user:password@ep-endpoint.region.neon.tech/dbname?sslmode=require" \
  backup.dump
```

### Importing Specific Data Elements
```bash
# Import schema only
pg_restore \
  --schema-only \
  --dbname="postgresql://user:password@ep-endpoint.region.neon.tech/dbname?sslmode=require" \
  backup.dump

# Import data only
pg_restore \
  --data-only \
  --dbname="postgresql://user:password@ep-endpoint.region.neon.tech/dbname?sslmode=require" \
  backup.dump
```

## CSV Import/Export Operations

### Exporting Data to CSV
```sql
-- Export table to CSV
COPY users TO '/tmp/users.csv' WITH (FORMAT csv, HEADER, DELIMITER ',', ENCODING 'UTF8');

-- Export query results to CSV
COPY (
  SELECT id, username, email, created_at
  FROM users
  WHERE created_at > '2023-01-01'
) TO '/tmp/recent_users.csv' WITH (FORMAT csv, HEADER);

-- Export with psql command
\copy users TO '/tmp/users.csv' WITH (FORMAT csv, HEADER);
```

### Importing CSV Data
```sql
-- Basic CSV import
COPY users(username, email, created_at)
FROM '/path/to/users.csv'
WITH (FORMAT csv, HEADER);

-- Import with error handling
COPY users(username, email, created_at)
FROM '/path/to/users.csv'
WITH (FORMAT csv, HEADER, ON_ERROR_STOP true);

-- Import with custom delimiter
COPY users(username, email, created_at)
FROM '/path/to/users.csv'
WITH (FORMAT csv, HEADER, DELIMITER ';');

-- Import using psql command
\copy users(username, email, created_at) FROM '/path/to/users.csv' WITH (FORMAT csv, HEADER);
```

### Python Script for CSV Import
```python
import psycopg2
import csv
from io import StringIO

def import_csv_to_neon(csv_file_path, table_name, connection_string):
    conn = psycopg2.connect(connection_string)
    cur = conn.cursor()

    try:
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            # Skip header
            next(f)

            # Use copy_expert for efficient bulk insert
            cur.copy_expert(f"COPY {table_name} FROM STDIN WITH CSV HEADER", f)

        conn.commit()
        print(f"Successfully imported {csv_file_path} to {table_name}")

    except Exception as e:
        conn.rollback()
        print(f"Error importing CSV: {e}")
        raise

    finally:
        cur.close()
        conn.close()

# Usage
connection_string = "postgresql://user:password@ep-endpoint.region.neon.tech/dbname?sslmode=require"
import_csv_to_neon('/path/to/users.csv', 'users', connection_string)
```

## Large Dataset Handling

### Optimizing for Large Imports
```python
import psycopg2
from psycopg2.extras import execute_batch
import pandas as pd

def import_large_dataset(df, table_name, connection_string, batch_size=10000):
    """
    Efficiently import large datasets using batch operations
    """
    conn = psycopg2.connect(connection_string)
    cur = conn.cursor()

    try:
        # Prepare the INSERT statement
        columns = ', '.join(df.columns)
        placeholders = ', '.join(['%s'] * len(df.columns))
        insert_query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"

        # Convert DataFrame to list of tuples
        data_tuples = [tuple(row) for row in df.values]

        # Execute in batches
        for i in range(0, len(data_tuples), batch_size):
            batch = data_tuples[i:i + batch_size]
            execute_batch(cur, insert_query, batch)
            print(f"Imported batch {i//batch_size + 1}: {len(batch)} records")

        conn.commit()
        print(f"Successfully imported {len(data_tuples)} records to {table_name}")

    except Exception as e:
        conn.rollback()
        print(f"Error importing large dataset: {e}")
        raise

    finally:
        cur.close()
        conn.close()

# Usage with pandas DataFrame
df = pd.read_csv('/path/to/large_file.csv')
import_large_dataset(df, 'large_table', connection_string)
```

### Handling Memory Constraints
```python
def import_large_csv_streaming(csv_file_path, table_name, connection_string, chunk_size=10000):
    """
    Stream large CSV files to avoid memory issues
    """
    import pandas as pd

    conn = psycopg2.connect(connection_string)
    cur = conn.cursor()

    try:
        # Read CSV in chunks
        chunk_iter = pd.read_csv(csv_file_path, chunksize=chunk_size)

        for i, chunk in enumerate(chunk_iter):
            # Prepare data for insertion
            columns = ', '.join(chunk.columns)
            placeholders = ', '.join(['%s'] * len(chunk.columns))
            insert_query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"

            # Convert chunk to list of tuples
            data_tuples = [tuple(row) for row in chunk.values]

            # Execute batch insert
            execute_batch(cur, insert_query, data_tuples)
            conn.commit()

            print(f"Imported chunk {i+1}: {len(data_tuples)} records")

    except Exception as e:
        conn.rollback()
        print(f"Error streaming CSV import: {e}")
        raise

    finally:
        cur.close()
        conn.close()
```

## Migration Strategies

### Migrating from Different Sources

#### Migrating from Heroku PostgreSQL
```bash
# 1. Create a backup on Heroku
heroku pg:backups:capture --app your-heroku-app

# 2. Get the backup URL
BACKUP_URL=$(heroku pg:backups:url --app your-heroku-app)

# 3. Download the backup
curl -o heroku_backup.dump $BACKUP_URL

# 4. Restore to Neon (adjust schema if needed)
pg_restore \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --single-transaction \
  --dbname="postgresql://user:password@neon_endpoint/dbname?sslmode=require" \
  heroku_backup.dump
```

#### Migrating from AWS RDS
```bash
# 1. Export from RDS (ensure security groups allow access)
pg_dump \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --format=custom \
  --compress=6 \
  "postgresql://rds_user:password@rds_endpoint:5432/database_name" > rds_export.dump

# 2. Transfer to Neon
pg_restore \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --single-transaction \
  --dbname="postgresql://user:password@neon_endpoint/dbname?sslmode=require" \
  rds_export.dump
```

#### Migrating from Supabase
```bash
# 1. Export from Supabase
pg_dump \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  "postgresql://supabase_user:password@db.supabase.co/database_name" > supabase_export.sql

# 2. Clean the export for Neon compatibility if needed
# Remove any Supabase-specific extensions or configurations

# 3. Import to Neon
psql "postgresql://user:password@neon_endpoint/dbname?sslmode=require" < supabase_export.sql
```

## Data Validation After Import

### Verification Scripts
```python
def validate_import(source_connection, target_connection, table_name):
    """
    Validate that data was imported correctly
    """
    import psycopg2

    # Connect to both databases
    source_conn = psycopg2.connect(source_connection)
    target_conn = psycopg2.connect(target_connection)

    try:
        # Count rows in both databases
        with source_conn.cursor() as source_cur:
            source_cur.execute(f"SELECT COUNT(*) FROM {table_name};")
            source_count = source_cur.fetchone()[0]

        with target_conn.cursor() as target_cur:
            target_cur.execute(f"SELECT COUNT(*) FROM {table_name};")
            target_count = target_cur.fetchone()[0]

        print(f"Source count: {source_count}")
        print(f"Target count: {target_count}")

        if source_count != target_count:
            print(f"⚠️  Warning: Row count mismatch for {table_name}")
            return False

        # Sample data comparison
        with source_conn.cursor() as source_cur:
            source_cur.execute(f"SELECT * FROM {table_name} LIMIT 5;")
            source_sample = source_cur.fetchall()

        with target_conn.cursor() as target_cur:
            target_cur.execute(f"SELECT * FROM {table_name} LIMIT 5;")
            target_sample = target_cur.fetchall()

        if source_sample != target_sample:
            print(f"⚠️  Warning: Sample data mismatch for {table_name}")
            return False

        print(f"✅ Validation passed for {table_name}")
        return True

    finally:
        source_conn.close()
        target_conn.close()

# Usage
source_conn = "postgresql://source_user:pass@source_host/source_db"
target_conn = "postgresql://target_user:pass@neon_endpoint/target_db"
validate_import(source_conn, target_conn, 'users')
```

### Integrity Checks
```sql
-- Check for referential integrity after import
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
JOIN
    information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN
    information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';

-- Verify indexes were created
SELECT
    t.relname AS table_name,
    i.relname AS index_name,
    a.attname AS column_name
FROM
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
WHERE
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relname LIKE 'your_table_name%'
ORDER BY
    t.relname, i.relname;
```

## Performance Optimization

### Optimizing Import Speed
```sql
-- Temporarily disable constraints during large imports
ALTER TABLE users DISABLE TRIGGER ALL;

-- Import data
\COPY users FROM 'users.csv' WITH (FORMAT csv, HEADER);

-- Re-enable constraints and validate
ALTER TABLE users ENABLE TRIGGER ALL;
ANALYZE users;

-- Or disable specific constraints
BEGIN;
ALTER TABLE users DROP CONSTRAINT fk_users_profile_id;
-- Import data
ALTER TABLE users ADD CONSTRAINT fk_users_profile_id FOREIGN KEY (profile_id) REFERENCES profiles(id);
COMMIT;
```

### Connection Pooling for Imports
```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
import pandas as pd

def optimized_bulk_import(df, table_name, connection_string):
    """
    Use SQLAlchemy with optimized connection settings for bulk imports
    """
    # Create engine with optimized settings for bulk operations
    engine = create_engine(
        connection_string,
        poolclass=QueuePool,
        pool_size=1,
        max_overflow=0,
        pool_pre_ping=True,
        pool_recycle=3600
    )

    try:
        # Use pandas to_sql with optimized parameters
        df.to_sql(
            name=table_name,
            con=engine,
            if_exists='append',  # Use 'replace' for full replacement
            index=False,
            method='multi',  # Use multi-row INSERT statements
            chunksize=10000  # Process in chunks
        )
        print(f"Successfully imported {len(df)} records to {table_name}")

    except Exception as e:
        print(f"Error during bulk import: {e}")
        raise

    finally:
        engine.dispose()
```

## Error Handling and Troubleshooting

### Common Import Issues and Solutions

#### Issue: "No more connections allowed"
- **Solution**: Use connection pooling or reduce import batch sizes
```bash
# Use pooled connection for large imports
psql "postgresql://user:pass@ep-pooler.region.neon.tech/db?sslmode=require" < large_file.sql
```

#### Issue: "SSL connection has been closed unexpectedly"
- **Solution**: Break large imports into smaller chunks
```python
def chunked_import(sql_file_path, connection_string, chunk_size=1000):
    """
    Import large SQL files in smaller chunks to avoid connection timeouts
    """
    with open(sql_file_path, 'r') as f:
        sql_content = f.read()

    # Split into chunks based on statements
    statements = sql_content.split(';')

    for i in range(0, len(statements), chunk_size):
        chunk = ';'.join(statements[i:i + chunk_size]) + ';'

        # Execute chunk
        conn = psycopg2.connect(connection_string)
        cur = conn.cursor()
        try:
            cur.execute(chunk)
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Error in chunk {i//chunk_size + 1}: {e}")
            raise
        finally:
            cur.close()
            conn.close()

        print(f"Completed chunk {i//chunk_size + 1}")
```

#### Issue: "Out of memory" during large imports
- **Solution**: Stream data instead of loading everything into memory
```python
def stream_large_csv_to_neon(csv_path, table_name, connection_string):
    """
    Stream large CSV files without loading everything into memory
    """
    import csv

    conn = psycopg2.connect(connection_string)
    cur = conn.cursor()

    try:
        with open(csv_path, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            headers = next(reader)  # Skip header

            # Prepare insert statement
            columns = ', '.join(headers)
            placeholders = ', '.join(['%s'] * len(headers))
            insert_stmt = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"

            # Process in batches
            batch = []
            batch_size = 1000

            for row in reader:
                batch.append(row)

                if len(batch) >= batch_size:
                    cur.executemany(insert_stmt, batch)
                    conn.commit()
                    print(f"Inserted batch of {len(batch)} rows")
                    batch = []  # Reset batch

            # Insert remaining rows
            if batch:
                cur.executemany(insert_stmt, batch)
                conn.commit()
                print(f"Inserted final batch of {len(batch)} rows")

    except Exception as e:
        conn.rollback()
        print(f"Error during streaming import: {e}")
        raise

    finally:
        cur.close()
        conn.close()
```

## Automation and Scheduling

### Automated Import Script
```python
#!/usr/bin/env python3
"""
Automated data import script for Neon
"""
import os
import subprocess
import logging
from datetime import datetime
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NeonDataImporter:
    def __init__(self, connection_string):
        self.connection_string = connection_string
        self.backup_dir = Path("./backups")
        self.backup_dir.mkdir(exist_ok=True)

    def backup_current_data(self, table_names=None):
        """Create backup of current data before import"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = self.backup_dir / f"backup_{timestamp}.sql"

        if table_names:
            # Backup specific tables
            tables_param = ' '.join([f"--table='{table}'" for table in table_names])
            cmd = f"pg_dump {tables_param} --no-owner --no-privileges '{self.connection_string}' > {backup_file}"
        else:
            # Backup entire database
            cmd = f"pg_dump --no-owner --no-privileges '{self.connection_string}' > {backup_file}"

        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            logger.error(f"Backup failed: {result.stderr}")
            raise Exception("Backup failed")

        logger.info(f"Backup created: {backup_file}")
        return backup_file

    def import_from_sql_file(self, sql_file_path):
        """Import data from SQL file"""
        cmd = f"psql '{self.connection_string}' < '{sql_file_path}'"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

        if result.returncode != 0:
            logger.error(f"Import failed: {result.stderr}")
            raise Exception(f"Import failed: {result.stderr}")

        logger.info(f"Successfully imported from {sql_file_path}")

    def import_from_csv(self, csv_path, table_name, has_header=True):
        """Import from CSV file"""
        # Create temporary connection to execute COPY command
        import psycopg2

        conn = psycopg2.connect(self.connection_string)
        cur = conn.cursor()

        try:
            copy_cmd = f"COPY {table_name} FROM STDIN WITH CSV {'HEADER' if has_header else ''}"
            with open(csv_path, 'r') as f:
                if has_header:
                    next(f)  # Skip header
                cur.copy_expert(copy_cmd, f)

            conn.commit()
            logger.info(f"Successfully imported {csv_path} to {table_name}")

        except Exception as e:
            conn.rollback()
            logger.error(f"CSV import failed: {e}")
            raise

        finally:
            cur.close()
            conn.close()

# Usage example
if __name__ == "__main__":
    neon_conn = os.getenv("NEON_DATABASE_URL")
    importer = NeonDataImporter(neon_conn)

    # Backup current data
    importer.backup_current_data(['users', 'products'])

    # Import new data
    importer.import_from_sql_file('./data/new_data.sql')
```

## Quick Reference

### Common Commands
```bash
# Export entire database
pg_dump "connection_string" > backup.sql

# Import SQL file
psql "connection_string" < backup.sql

# Export specific table
pg_dump --table='table_name' "connection_string" > table_backup.sql

# Export with custom format
pg_dump --format=custom "connection_string" > backup.dump

# Restore custom format
pg_restore --dbname="connection_string" backup.dump

# Export to CSV
psql "connection_string" -c "\copy table_name TO 'output.csv' WITH CSV HEADER;"

# Import from CSV
psql "connection_string" -c "\copy table_name FROM 'input.csv' WITH CSV HEADER;"
```

### Performance Tips
- Use connection pooling for large imports
- Break large operations into smaller chunks
- Temporarily disable constraints during bulk imports
- Use ANALYZE after large imports to update statistics
- Monitor compute usage during import operations
- Use appropriate batch sizes (1000-10000 records typically optimal)

### Best Practices
- Always backup before importing large amounts of data
- Validate data after import
- Use pooled connections for applications with many concurrent operations
- Test import procedures on development branches first
- Monitor for performance impacts during large imports
- Consider import timing to minimize impact on production traffic