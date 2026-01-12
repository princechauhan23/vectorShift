# Database connection and session management

import os
from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
# Create engine for PostgreSQL
engine = None
if DATABASE_URL:
    engine = create_engine(DATABASE_URL, echo=True)
else:
    raise RuntimeError("DATABASE_URL is not set")

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

        yield session
