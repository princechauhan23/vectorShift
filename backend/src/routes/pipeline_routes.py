# Pipeline API Routes

from fastapi import APIRouter, Depends
from sqlmodel import Session

from src.config import get_db
from src.controllers import PipelineController
from src.schemas import PipelineCreate, PipelineParseResponse

router = APIRouter(prefix="/pipelines", tags=["pipelines"])


@router.post(
    "/",
    summary="Create a new pipeline",
    description="Create a new pipeline configuration."
)
def create_pipeline(pipeline_data: PipelineCreate, db: Session = Depends(get_db)):
    """
    Create a new pipeline.
    
    - **nodes**: List of pipeline nodes
    - **edges**: List of connections between nodes
    """
    print(pipeline_data, "pipeline_data")
    return pipeline_data


@router.post(
    "/parse",
    response_model=PipelineParseResponse,
    summary="Parse and execute a pipeline",
    description="Parse the pipeline structure and execute it through LLM nodes."
)
async def parse_pipeline(pipeline_data: PipelineCreate, db: Session = Depends(get_db)):
    """
    Parse and execute a pipeline.
    
    - Validates the pipeline is a DAG (Directed Acyclic Graph)
    - Processes nodes in topological order
    - Executes LLM nodes with connected text inputs
    - Returns outputs as list of {output_node_id: result}
    """
    return await PipelineController.parse_pipeline(pipeline_data)
