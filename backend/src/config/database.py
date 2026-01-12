# Database connection and session management

import os
from urllib.parse import quote_plus
from sqlmodel import SQLModel, Session
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Fetch variables from environment
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port", "5432")
DBNAME = os.getenv("dbname")

# URL-encode username and password to handle special characters (@, #, etc.)
ENCODED_USER = quote_plus(USER) if USER else None
ENCODED_PASSWORD = quote_plus(PASSWORD) if PASSWORD else None

# Construct the SQLAlchemy connection string for Supabase
DATABASE_URL = f"postgresql+psycopg2://{ENCODED_USER}:{ENCODED_PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

# Create the SQLAlchemy engine
# Using NullPool for serverless/pooler compatibility
engine = None
if all([USER, PASSWORD, HOST, DBNAME]):
    engine = create_engine(DATABASE_URL, poolclass=NullPool, echo=True)
else:
    raise RuntimeError("Database credentials are not fully set. Required: user, password, host, dbname")


def init_db():
    """Initialize database tables."""
    if engine is not None:
        SQLModel.metadata.create_all(engine)
    else:
        raise RuntimeError("Database engine is not initialized")


def get_db():
    """Dependency that provides a database session."""
    if engine is not None:
        with Session(engine) as session:
            yield session
    else:
        raise RuntimeError("Database engine is not initialized")
