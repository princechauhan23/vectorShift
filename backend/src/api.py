# API Router - Combines all route modules

from fastapi import APIRouter
from src.routes import node_router, pipeline_router

router = APIRouter(prefix="/api/v1")

# Include all module routers
router.include_router(node_router)
router.include_router(pipeline_router)
