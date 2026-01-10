# Node Pydantic schemas for API request/response

import uuid
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field


class NodeCreate(BaseModel):
    """Schema for creating a new node."""
    type: str = Field(..., description="Unique type identifier for the node")
    title: str = Field(..., description="Display title of the node")
    label: str = Field(..., description="Label for the node")
    tab: str = Field(default="GENERAL", description="Tab category for the node")
    description: Optional[str] = Field(default=None, description="Description of the node")
    accent: Optional[str] = Field(default=None, description="Accent color for the node")
    fields: List[Any] = Field(default=[], description="JSON array of field definitions")
    handles: List[Any] = Field(default=[], description="JSON array of handle definitions")

    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "text_input",
                "title": "Text Input",
                "label": "Input",
                "tab": "GENERAL",
                "description": "A text input node",
                "accent": "#3b82f6",
                "fields": [
                    {"name": "value", "type": "text", "label": "Value"}
                ],
                "handles": [
                    {"id": "output", "type": "source", "position": "right"}
                ]
            }
        }
    }


class NodeResponse(BaseModel):
    """Schema for node response."""
    id: uuid.UUID
    type: str
    title: str
    label: str
    tab: str
    description: Optional[str]
    accent: Optional[str]
    fields: List[Any]
    handles: List[Any]
    created_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }
