# Node API Routes

from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from src.config import get_db
from src.controllers import NodeController
from src.schemas.node import NodeCreate, NodeResponse

router = APIRouter(prefix="/nodes", tags=["nodes"])


@router.post(
    "/",
    response_model=NodeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new node",
    description="Create a new node definition with the provided data."
)
def create_node(node_data: NodeCreate, db: Session = Depends(get_db)):
    """
    Create a new node.
    
    - **type**: Unique type identifier (must be unique)
    - **title**: Display title
    - **label**: Node label
    - **tab**: Category tab (default: GENERAL)
    - **description**: Optional description
    - **accent**: Optional accent color
    - **fields**: JSON array of field definitions
    - **handles**: JSON array of handle definitions
    """
    return NodeController.create_node(db, node_data)


@router.get(
    "/",
    response_model=List[NodeResponse],
    summary="Get all nodes",
    description="Retrieve all node definitions from the database."
)
def get_all_nodes(db: Session = Depends(get_db)):
    """
    Get all nodes. Returns a list of all node definitions ordered by creation date.
    """
    return NodeController.get_all_nodes(db)


@router.get(
    "/{node_type}",
    response_model=NodeResponse,
    summary="Get node by type",
    description="Retrieve a specific node definition by its type."
)
def get_node_by_type(node_type: str, db: Session = Depends(get_db)):
    """
    Get a node by its type.
    """
    return NodeController.get_node_by_type(db, node_type)


@router.delete(
    "/{node_type}",
    summary="Delete node by type",
    description="Delete a node definition by its type."
)
def delete_node(node_type: str, db: Session = Depends(get_db)):
    """
    Delete a node by its type.
    """
    return NodeController.delete_node(db, node_type)
