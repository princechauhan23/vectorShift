# Pipeline Controller - Business logic for pipeline operations

from typing import Dict, List
from fastapi import HTTPException

from src.schemas import (
    PipelineNode,
    PipelineEdge,
    PipelineCreate,
    PipelineParseResponse,
)
from src.utils import (
    is_dag,
    topological_sort,
    find_nodes_by_type,
    get_connected_inputs,
    interpolate_variables,
    execute_llm,
)


class PipelineController:
    """Controller for pipeline-related business logic."""
    
    # LLM node types
    LLM_TYPES = ["gemini", "openai", "llm", "gpt", "claude", "mistral"]
    
    # Output node types
    OUTPUT_TYPES = ["output", "result"]
    
    # Input node types
    INPUT_TYPES = ["text", "input", "text_input", "textinput"]
    
    # Default LLM instructions
    DEFAULT_INSTRUCTIONS = """You are an expert researcher with strong analytical and summarization skills.
Your task is to research and analyze the text provided below, identifying the most important facts, insights, and implications.
Strict requirements:
- Your response must be no more than 100 words.
- Be factual, concise, and neutral in tone.
- Do not add assumptions or information not supported by the input text.
- Avoid repetition and unnecessary context."""
    
    @staticmethod
    async def execute_pipeline(nodes: List[PipelineNode], edges: List[PipelineEdge]) -> Dict[str, str]:
        """
        Execute the pipeline by processing nodes in topological order.
        
        Args:
            nodes: List of pipeline nodes
            edges: List of pipeline edges
            
        Returns:
            Dict mapping node_id to its output value
        """
        # Build a dictionary for quick node lookup
        nodes_dict = {node.id: node for node in nodes}

        # Get execution order
        exec_order = topological_sort(nodes, edges)
        
        # Store intermediate results
        node_outputs: Dict[str, str] = {}
        
        for node_id in exec_order:
            node = nodes_dict.get(node_id)
            if not node or not node.data:
                continue
            
            node_type = (node.type or "").lower()
            
            # Text/Input nodes - store their text as output
            if node_type in PipelineController.INPUT_TYPES:
                text_value = node.data.text or ""
                node_outputs[node_id] = text_value
            
            # LLM nodes - gather inputs and execute
            elif node_type in PipelineController.LLM_TYPES:
                node_outputs[node_id] = await PipelineController._process_llm_node(
                    node, edges, nodes_dict, node_outputs
                )
            
            # Output nodes - collect the result from connected input
            elif node_type in PipelineController.OUTPUT_TYPES:
                input_nodes = get_connected_inputs(node_id, edges, nodes_dict)
                for input_node in input_nodes:
                    if input_node.id in node_outputs:
                        node_outputs[node_id] = node_outputs[input_node.id]
                        break
        
        return node_outputs
    
    @staticmethod
    async def _process_llm_node(
        node: PipelineNode,
        edges: List[PipelineEdge],
        nodes_dict: Dict[str, PipelineNode],
        node_outputs: Dict[str, str]
    ) -> str:
        """
        Process a single LLM node.
        
        Args:
            node: The LLM node to process
            edges: List of pipeline edges
            nodes_dict: Dict of all nodes by ID
            node_outputs: Current node outputs
            
        Returns:
            LLM response string
        """
        # Get all input values connected to this LLM node
        input_nodes = get_connected_inputs(node.id, edges, nodes_dict)
        input_texts = []
        
        for input_node in input_nodes:
            if input_node.id in node_outputs:
                input_texts.append(node_outputs[input_node.id])
            elif input_node.data and input_node.data.text:
                input_texts.append(input_node.data.text)
        
        # Combine all inputs from connected nodes
        combined_input = "\n".join(input_texts) if input_texts else ""
        
        # Get LLM instructions and prompt
        instructions = PipelineController.DEFAULT_INSTRUCTIONS
        if node.data.Instructions:
            instructions = instructions + "\n" + node.data.Instructions
        
        prompt_template = node.data.Prompt or ""
        
        # Interpolate variables in the prompt (replace {{node-id}} with actual values)
        prompt_template = interpolate_variables(prompt_template, node_outputs, nodes_dict)
        
        # Also interpolate variables in instructions
        instructions = interpolate_variables(instructions, node_outputs, nodes_dict)
        
        # Build the final prompt
        if prompt_template and prompt_template != "Enter Query/Prompt":
            # Check if prompt contains variables - if so, use it directly
            if "{{" not in (node.data.Prompt or ""):
                final_prompt = f"{prompt_template}\n\nInput: {combined_input}"
            else:
                # Variables were interpolated, use the prompt as is
                final_prompt = prompt_template
        else:
            final_prompt = combined_input

        # Execute the LLM
        return await execute_llm(final_prompt, instructions)
    
    @staticmethod
    async def parse_pipeline(pipeline_data: PipelineCreate) -> PipelineParseResponse:
        """
        Parse and execute a pipeline.
        
        Args:
            pipeline_data: Pipeline creation data with nodes and edges
            
        Returns:
            PipelineParseResponse with execution results
        """
        nodes = pipeline_data.nodes
        edges = pipeline_data.edges
        
        # Check if the pipeline forms a valid DAG
        pipeline_is_dag = is_dag(nodes, edges)
        
        response = PipelineParseResponse(
            num_nodes=len(nodes),
            num_edges=len(edges),
            is_dag=pipeline_is_dag
        )

        if not pipeline_is_dag:
            response.error = "Pipeline contains a cycle and is not a valid DAG"
            return response
        
        # Execute the pipeline if we have nodes
        if nodes:
            try:
                # Get all node outputs
                node_outputs = await PipelineController.execute_pipeline(nodes, edges)
                
                # Find all output nodes and create the outputs list
                output_nodes = find_nodes_by_type(nodes, PipelineController.OUTPUT_TYPES)
                
                # Build outputs list: [{output_node_id: result}, ...]
                outputs_list = []
                for output_node in output_nodes:
                    output_id = output_node.id
                    result = node_outputs.get(output_id, "No output generated")
                    outputs_list.append({output_id: result})
                
                response.outputs = outputs_list
                        
            except HTTPException as e:
                response.error = e.detail
            except Exception as e:
                response.error = f"Pipeline execution error: {str(e)}"
        
        return response
