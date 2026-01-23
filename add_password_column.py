#!/usr/bin/env python3
"""
Script to add password column to users table in the database
"""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
database_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")

# Remove quotes if they exist
if database_url:
    database_url = database_url.strip("'\"")

    # Remove +asyncpg part if present to make it compatible with asyncpg
    if '+asyncpg' in database_url:
        database_url = database_url.replace('+asyncpg', '')

if not database_url:
    raise ValueError("DATABASE_URL environment variable not set")


async def add_password_column():
    """Add password column to the users table"""
    # Connect to the database
    conn = await asyncpg.connect(database_url)

    try:
        # Check if the password column already exists
        column_check_query = """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = 'password'
        """

        existing_column = await conn.fetchval(column_check_query)

        if existing_column:
            print("Password column already exists in users table")
        else:
            # Add the password column to the users table
            alter_table_query = """
                ALTER TABLE users ADD COLUMN password TEXT;
            """

            await conn.execute(alter_table_query)
            print("Password column added to users table successfully!")

        # Verify the column exists
        print("Verifying the users table structure...")
        columns_query = """
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        """

        columns = await conn.fetch(columns_query)
        print("\nColumns in users table:")
        for col in columns:
            print(f"- {col['column_name']}: {col['data_type']}")

    except Exception as e:
        print(f"Error adding password column: {e}")
    finally:
        await conn.close()


if __name__ == "__main__":
    print("Adding password column to users table...")
    asyncio.run(add_password_column())
    print("Done!")