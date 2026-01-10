# Pipeline Pydantic schemas for API request/response

from typing import Optional, List, Dict
from pydantic import BaseModel


class Position(BaseModel):
    """Position coordinates for a node."""
    x: float
    y: float


class MarkerEnd(BaseModel):
    """Marker configuration for edge endpoints."""
    type: Optional[str] = None
    height: Optional[str] = None
    width: Optional[str] = None


class NodeData(BaseModel):
    """Data payload for a pipeline node."""
    id: str
    nodeType: str
    # Text node fields
    text: Optional[str] = None
    # LLM node fields (gemini, openai, mistral, etc.)
    Instructions: Optional[str] = None
    Prompt: Optional[str] = None
    # Output node fields
    output: Optional[str] = None

    class Config:
        extra = "allow"  # Allow additional fields


class PipelineNode(BaseModel):
    """Represents a node in the pipeline."""
    id: str
    type: Optional[str] = None
    position: Optional[Position] = None
    data: Optional[NodeData] = None
    width: Optional[int] = None
    height: Optional[int] = None
    selected: Optional[bool] = None
    positionAbsolute: Optional[Position] = None
    dragging: Optional[bool] = None


class PipelineEdge(BaseModel):
    """Represents an edge (connection) between nodes."""
    id: Optional[str] = None
    source: str
    sourceHandle: Optional[str] = None
    target: str
    targetHandle: Optional[str] = None
    type: Optional[str] = None
    animated: Optional[bool] = None
    markerEnd: Optional[MarkerEnd] = None


class PipelineCreate(BaseModel):
    """Request body for pipeline operations."""
    nodes: List[PipelineNode]
    edges: List[PipelineEdge]


class PipelineParseResponse(BaseModel):
    """Response from pipeline parsing."""
    num_nodes: int
    num_edges: int
    is_dag: bool
    outputs: Optional[List[Dict[str, str]]] = None  # List of {output_node_id: result}
    error: Optional[str] = None
