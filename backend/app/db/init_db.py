from sqlmodel import SQLModel

from app.db.database import async_engine


async def create_db_and_tables():
    """
    Create all database tables.
    This function should be called at application startup.
    """
    async with async_engine.begin() as conn:
        # Create all tables defined in the models
        await conn.run_sync(SQLModel.metadata.create_all)
