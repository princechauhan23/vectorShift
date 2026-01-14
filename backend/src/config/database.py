# Database connection and session management (adapted from Supabase docs)

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
# from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel, Session
from urllib.parse import quote_plus

# Load environment variables from .env
load_dotenv()

# Fetch variables
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port", "5432")
DBNAME = os.getenv("dbname")

if not all([USER, PASSWORD, HOST, DBNAME]):
    raise RuntimeError("Database credentials are not fully set. Required: user, password, host, dbname")

# URL-encode username/password to survive special characters (#, @, etc.)
ENCODED_USER = quote_plus(USER)
ENCODED_PASSWORD = quote_plus(PASSWORD)

# Guard against misconfigured host containing credentials
if "@" in HOST:
    raise RuntimeError(
        "The 'host' env var appears to include credentials. "
        "Set 'host' to the bare domain (e.g. aws-1-ap-south-1.pooler.supabase.com) "
        "and keep username/password in 'user'/'password'."
    )

# Construct the SQLAlchemy connection string
DATABASE_URL = f"postgresql+psycopg2://{ENCODED_USER}:{ENCODED_PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)
# If using Transaction Pooler or Session Pooler, disable client-side pooling:
# engine = create_engine(DATABASE_URL, poolclass=NullPool)


def init_db():
    """Initialize database tables."""
    SQLModel.metadata.create_all(engine)


def get_db():
    """Dependency that provides a database session."""
    with Session(engine) as session:
        yield session


def _test_connection():
    """Test database connectivity (mirrors Supabase sample)."""
    try:
        with engine.connect() as connection:
            print("Connection successful!")
    except Exception as e:  # pragma: no cover - diagnostic helper
        print(f"Failed to connect: {e}")


if __name__ == "__main__":
    _test_connection()
