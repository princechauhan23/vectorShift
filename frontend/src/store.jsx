// store.js

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const useStore = create(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      nodeIDs: {},

      // Pipeline execution state (not persisted)
      pipelineResult: null,
      pipelineLoading: false,
      pipelineError: null,

      getNodeID: (type) => {
        const newIDs = { ...get().nodeIDs };
        if (newIDs[type] === undefined) {
          newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({ nodeIDs: newIDs });
        return `${type}-${newIDs[type]}`;
      },

      addNode: (node) => {
        set({
          nodes: [...get().nodes, node]
        });
      },

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection) => {
        set({
          edges: addEdge(
            {
              ...connection,
              type: 'smoothstep',
              animated: true,
              markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' }
            },
            get().edges
          ),
        });
      },

      // Create edge between two nodes (used when variable is selected)
      addEdgeBetweenNodes: (sourceNodeId, targetNodeId, completeNodes) => {
        const { edges, onConnect } = get();

        // Check if edge already exists
        const edgeExists = edges.some(
          edge => edge.source === sourceNodeId && edge.target === targetNodeId
        );

        if (edgeExists) return; // Don't create duplicate edges

        const targetNodeIDSplitted = targetNodeId.split('-')[0];
        const targetNode = completeNodes.find(node => node.type === targetNodeIDSplitted);
        const targetHandleId = targetNode.handles[0].id;

        // Create connection object and use onConnect to add the edge
        // This ensures ReactFlow properly handles the edge addition
        const connection = {
          source: sourceNodeId,
          sourceHandle: `${sourceNodeId}-output`,
          target: targetNodeId,
          targetHandle: `${targetNodeId}-${targetHandleId}`,
        };

        // Use the existing onConnect function which properly handles ReactFlow updates
        onConnect(connection);
      },

      updateNodeField: (nodeId, fieldName, fieldValue) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === nodeId) {
              node.data = { ...node.data, [fieldName]: fieldValue };
            }
            return node;
          }),
        });
      },

      // Pipeline API actions
      parsePipeline: async () => {
        const { nodes, edges, updateNodeField } = get();

        set({ pipelineLoading: true, pipelineError: null, pipelineResult: null });

        try {
          const response = await fetch(`${API_BASE_URL}/pipelines/parse`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nodes, edges }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to parse pipeline');
          }

          const result = await response.json();

          // Update output nodes with their respective results using updateNodeField
          if (result.outputs && Array.isArray(result.outputs) && !result.error) {
            result.outputs.forEach(outputObj => {
              // Each outputObj is like {"Output-1": "result text"}
              const outputNodeId = Object.keys(outputObj)[0];
              const outputValue = outputObj[outputNodeId];

              // Update the output node's 'output' field with the result
              updateNodeField(outputNodeId, 'output', outputValue);
            });
          }

          set({
            pipelineResult: result,
            pipelineLoading: false,
            pipelineError: result.error || null
          });

          return { success: !result.error, data: result };
        } catch (error) {
          console.error('Pipeline error:', error);
          set({
            pipelineError: error.message,
            pipelineLoading: false,
            pipelineResult: null
          });
          return { success: false, error: error.message };
        }
      },

      clearPipelineResult: () => {
        const { nodes, updateNodeField } = get();

        // Clear the _pipelineResult from output nodes using updateNodeField
        nodes.forEach(node => {
          if (node.data && node.data._pipelineResult !== undefined) {
            updateNodeField(node.id, '_pipelineResult', undefined);
            updateNodeField(node.id, 'output', node.data.output === node.data._pipelineResult ? '' : node.data.output);
          }
        });

        set({
          pipelineResult: null,
          pipelineError: null
        });
      },
    }),
    {
      name: 'pipeline-store',
      // Only persist nodes, edges, and nodeIDs (not transient pipeline execution state)
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        nodeIDs: state.nodeIDs,
      }),
    }
  )
);
