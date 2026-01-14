from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.tasks import router as tasks_router
from app.core.exception_handlers import register_exception_handlers
from app.db.init_db import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await create_db_and_tables()
    yield
    # Any cleanup on shutdown can go here


app = FastAPI(
    title="Todo Backend API",
    description="A simple todo application backend API",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
register_exception_handlers(app)

# Include API routers
app.include_router(tasks_router, prefix="/api/v1", tags=["Tasks"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Todo Backend API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
