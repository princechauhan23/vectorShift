# Database connection and session management

import os
from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# Create engine for PostgreSQL
engine = create_engine(os.getenv("DATABASE_URL", ""), echo=True)


def init_db():
    """Initialize database tables."""
    SQLModel.metadata.create_all(engine)


def get_db():
    """Dependency that provides a database session."""
    with Session(engine) as session:
        yield session
