from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

from app.config import settings

# Create async engine
async_engine = create_async_engine(
    settings.database_url,
    echo=True,  # Set to False in production
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)


# Dependency for getting async session
async def get_session():
    async with AsyncSession(async_engine) as session:
        yield session


# Function to initialize database (to be called at app startup)
async def init_db():
    # This function can be expanded to include table creation logic
    pass
