# Node model definition

import uuid
from datetime import datetime
from typing import Optional, List, Any
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text
from sqlalchemy.dialects.postgresql import JSONB


class Node(SQLModel, table=True):
    """
    Node table model.
    
    Represents a node definition with its metadata, fields, and handles.
    """
    __tablename__ = "nodes"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        description="Unique identifier for the node"
    )
    type: str = Field(
        unique=True,
        nullable=False,
        description="Unique type identifier for the node"
    )
    title: str = Field(
        nullable=False,
        description="Display title of the node"
    )
    label: str = Field(
        nullable=False,
        description="Label for the node"
    )
    tab: str = Field(
        default="GENERAL",
        nullable=False,
        description="Tab category for the node"
    )
    description: Optional[str] = Field(
        default=None,
        sa_column=Column(Text),
        description="Description of the node"
    )
    accent: Optional[str] = Field(
        default=None,
        description="Accent color for the node"
    )
    fields: List[Any] = Field(
        default=[],
        sa_column=Column(JSONB, nullable=False, server_default="[]"),
        description="JSON array of field definitions"
    )
    handles: List[Any] = Field(
        default=[],
        sa_column=Column(JSONB, nullable=False, server_default="[]"),
        description="JSON array of handle definitions"
    )
    created_at: Optional[datetime] = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when the node was created"
    )
