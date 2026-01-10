# Graph utility functions for pipeline processing

import re
from typing import Dict, List

from src.schemas import PipelineNode, PipelineEdge


def build_adjacency_list(nodes: List[PipelineNode], edges: List[PipelineEdge]) -> Dict[str, List[str]]:
    """Build an adjacency list from nodes and edges."""
    adj = {node.id: [] for node in nodes}
    for edge in edges:
        if edge.source in adj:
            adj[edge.source].append(edge.target)
    return adj


def is_dag(nodes: List[PipelineNode], edges: List[PipelineEdge]) -> bool:
    """Check if the pipeline forms a Directed Acyclic Graph (DAG)."""
    adj = build_adjacency_list(nodes, edges)
    visited = set()
    rec_stack = set()
    
    def has_cycle(node_id: str) -> bool:
        visited.add(node_id)
        rec_stack.add(node_id)
        
        for neighbor in adj.get(node_id, []):
            if neighbor not in visited:
                if has_cycle(neighbor):
                    return True
            elif neighbor in rec_stack:
                return True
        
        rec_stack.remove(node_id)
        return False
    
    for node in nodes:
        if node.id not in visited:
            if has_cycle(node.id):
                return False
    return True


def topological_sort(nodes: List[PipelineNode], edges: List[PipelineEdge]) -> List[str]:
    """Return nodes in topological order (execution order)."""
    adj = build_adjacency_list(nodes, edges)
    in_degree = {node.id: 0 for node in nodes}
    
    for edge in edges:
        if edge.target in in_degree:
            in_degree[edge.target] += 1
    
    queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
    result = []
    
    while queue:
        node_id = queue.pop(0)
        result.append(node_id)
        
        for neighbor in adj.get(node_id, []):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    return result


def find_nodes_by_type(nodes: List[PipelineNode], node_types: List[str]) -> List[PipelineNode]:
    """Find all nodes matching the given types."""
    return [node for node in nodes if node.type and node.type.lower() in [t.lower() for t in node_types]]


def get_connected_inputs(node_id: str, edges: List[PipelineEdge], nodes_dict: Dict[str, PipelineNode]) -> List[PipelineNode]:
    """Get all nodes that are connected as inputs to the given node."""
    input_nodes = []
    for edge in edges:
        if edge.target == node_id:
            source_node = nodes_dict.get(edge.source)
            if source_node:
                input_nodes.append(source_node)
    return input_nodes


def interpolate_variables(text: str, node_outputs: Dict[str, str], nodes_dict: Dict[str, PipelineNode]) -> str:
    """
    Replace variable placeholders like {{node-id}} with actual node values.
    
    Args:
        text: The text containing variable placeholders
        node_outputs: Dict of node_id -> output value (already processed nodes)
        nodes_dict: Dict of node_id -> PipelineNode (for getting raw node data)
    
    Returns:
        Text with all {{node-id}} placeholders replaced with actual values
    """
    if not text:
        return text
    
    # Pattern to match {{node-id}} - captures the node ID inside
    pattern = r'\{\{([^}]+)\}\}'
    
    def replace_variable(match):
        node_id = match.group(1).strip()
        
        # First check if the node has already been processed
        if node_id in node_outputs:
            return node_outputs[node_id]
        
        # Otherwise, try to get the raw value from the node data
        node = nodes_dict.get(node_id)
        if node and node.data:
            # Try to get text value from the node
            if node.data.text:
                return node.data.text
            # Fallback to any output field
            if hasattr(node.data, 'output') and node.data.output:
                return node.data.output
        
        # If no value found, return the original placeholder
        return match.group(0)
    
    return re.sub(pattern, replace_variable, text)
