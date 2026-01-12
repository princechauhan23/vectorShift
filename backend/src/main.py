# Main FastAPI application

import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
load_dotenv()

from src.api import router
from src.config.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    # Startup: Initialize database tables
    init_db()
    
    yield
    # Shutdown: Cleanup if needed


# Create FastAPI application
app = FastAPI(
    title="Node Builder API",
    description="API for managing node definitions",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(router)


@app.get("/", tags=["health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Node Builder API is running"}
    