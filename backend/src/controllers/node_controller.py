# Node Controller - Business logic for node operations

from typing import List
from fastapi import HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from src.models.node import Node
from src.schemas.node import NodeCreate


class NodeController:
    """Controller for node-related business logic."""
    
    @staticmethod
    def create_node(db: Session, node_data: NodeCreate) -> Node:
        """
        Create a new node definition.
        
        Args:
            db: Database session
            node_data: Node creation data
            
        Returns:
            Created node
            
        Raises:
            HTTPException: If node type already exists or database error
        """
        try:
            # Check if node type already exists
            existing_node = db.exec(
                select(Node).where(Node.type == node_data.type)
            ).first()

            if existing_node:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Node with type '{node_data.type}' already exists"
                )
            
            # Create new node
            node = Node(**node_data.model_dump())
            db.add(node)
            db.commit()
            db.refresh(node)
            
            return node
            
        except HTTPException:
            raise
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Database integrity error: {str(e)}"
            )
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
    
    @staticmethod
    def get_all_nodes(db: Session) -> List[Node]:
        """
        Get all node definitions.
        
        Args:
            db: Database session
            
        Returns:
            List of all nodes ordered by creation date
            
        Raises:
            HTTPException: If database error occurs
        """
        try:
            nodes = db.exec(select(Node).order_by(Node.created_at.desc())).all()
            return nodes
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
    
    @staticmethod
    def get_node_by_type(db: Session, node_type: str) -> Node:
        """
        Get a node by its type.
        
        Args:
            db: Database session
            node_type: The node type to search for
            
        Returns:
            Node if found
            
        Raises:
            HTTPException: If node not found or database error
        """
        try:
            node = db.exec(select(Node).where(Node.type == node_type)).first()
            
            if not node:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Node with type '{node_type}' not found"
                )
            
            return node
        except HTTPException:
            raise
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
    
    @staticmethod
    def delete_node(db: Session, node_type: str) -> dict:
        """
        Delete a node by its type.
        
        Args:
            db: Database session
            node_type: The node type to delete
            
        Returns:
            Success message
            
        Raises:
            HTTPException: If node not found or database error
        """
        try:
            node = db.exec(select(Node).where(Node.type == node_type)).first()
            
            if not node:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Node with type '{node_type}' not found"
                )
            
            db.delete(node)
            db.commit()
            
            return {"message": f"Node '{node_type}' deleted successfully"}
        except HTTPException:
            raise
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
