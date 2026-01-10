// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useMemo } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from '../store';
import { getNodeTypes, getInitialDataForType } from '../nodes/nodeRegistry';

import 'reactflow/dist/style.css';
import SubmitButton from './submit';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    
    // Subscribe to individual state slices for proper reactivity
    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);
    const getNodeID = useStore((state) => state.getNodeID);
    const addNode = useStore((state) => state.addNode);
    const onNodesChange = useStore((state) => state.onNodesChange);
    const onEdgesChange = useStore((state) => state.onEdgesChange);
    const onConnect = useStore((state) => state.onConnect);
    const parsePipeline = useStore((state) => state.parsePipeline);
    const pipelineResult = useStore((state) => state.pipelineResult);
    const pipelineLoading = useStore((state) => state.pipelineLoading);
    const pipelineError = useStore((state) => state.pipelineError);
    const clearPipelineResult = useStore((state) => state.clearPipelineResult);

    // Memoize node types to prevent ReactFlow from re-registering on every render
    const nodeTypes = useMemo(() => getNodeTypes(), []);

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: { id: nodeID, ...getInitialDataForType(type) },
            };
      
            addNode(newNode);
          }
        },
        [reactFlowInstance]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const handleSubmit = async () => {
        const result = await parsePipeline();
    }

    return (
        <>
        <div ref={reactFlowWrapper} style={{width: '100vw', height: '70vh', minWidth: '100vw', minHeight: '70vh'}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
            >
                <Background color="#aaa" gap={gridSize} />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
        <SubmitButton onClick={handleSubmit} disabled={pipelineLoading} />
        
        {/* Pipeline Result Display */}
        {pipelineLoading && (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '20px',
                color: '#666'
            }}>
                <span>Processing pipeline...</span>
            </div>
        )}
        
        {pipelineError && (
            <div style={{
                margin: '20px auto',
                padding: '15px 20px',
                maxWidth: '800px',
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#dc2626'
            }}>
                <strong>Error:</strong> {pipelineError}
            </div>
        )}
        
        {pipelineResult && !pipelineError && (
            <div style={{
                margin: '20px auto',
                padding: '20px',
                maxWidth: '800px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: '8px'
            }}>
                <div style={{ marginBottom: '10px', color: '#166534' }}>
                    <strong>Pipeline Info:</strong> {pipelineResult.num_nodes} nodes, {pipelineResult.num_edges} edges
                    {pipelineResult.is_dag ? ' (Valid DAG)' : ' (Invalid - contains cycle)'}
                </div>
                {pipelineResult.outputs && Array.isArray(pipelineResult.outputs) && pipelineResult.outputs.length > 0 && (
                    <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        backgroundColor: '#fff',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        lineHeight: '1.6'
                    }}>
                        {pipelineResult.outputs.map((output) => {
                            const outputId = Object.keys(output)[0];
                            const outputValue = output[outputId];
                            return (
                            <div key={outputId} style={{ marginBottom: '10px' }}>
                                <strong style={{ color: '#166534' }}>{outputId}:</strong>
                                <div style={{ marginTop: '10px' }}>{outputValue || 'No output'}</div>
                            </div>
                        );
                    })}
                    </div>
                )}
                <button 
                    onClick={clearPipelineResult}
                    style={{
                        marginTop: '15px',
                        padding: '8px 16px',
                        backgroundColor: '#e5e7eb',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Result
                </button>
            </div>
        )}
        </>
    )
}

export default PipelineUI;