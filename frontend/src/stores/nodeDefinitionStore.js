// Store for managing node definitions (CRUD operations with backend)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const useNodeDefinitionStore = create(
  persist(
    (set, get) => ({
      completeNodes: [],
      toolbarNodes: [],
      nodeConfigs: {},
      isLoading: false,
      error: null,

      // Set toolbar nodes (called from nodeRegistry after transformation)
      setToolbarNodes: (nodes) => set({ toolbarNodes: nodes }),

      // Set node configs (called from nodeRegistry after transformation)
      setNodeConfigs: (configs) => set({ nodeConfigs: configs }),

      // Create a new node definition
      createNodeDefinition: async (nodeData) => {
        set({ isLoading: true, error: null });

        try {
          // Transform handles to include style object for top positioning
          const transformedData = {
            ...nodeData,
            handles: nodeData.handles.map((handle) => ({
              id: handle.id,
              type: handle.type,
              position: handle.position,
              ...(handle.top && { style: { top: handle.top } }),
            })),
          };

          const response = await fetch(`${API_BASE_URL}/nodes/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformedData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create node');
          }

          const createdNode = await response.json();

          set((state) => ({
            completeNodes: [...state.completeNodes, createdNode],
            isLoading: false,
          }));

          return { success: true, data: createdNode };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Fetch all node definitions
      fetchNodeDefinitions: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/nodes/`);

          if (!response.ok) {
            throw new Error('Failed to fetch nodes');
          }

          const nodes = await response.json();
          set({ completeNodes: nodes, isLoading: false });

          return { success: true, data: nodes };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'node-definition-storage',
      // Only persist these fields
      partialize: (state) => ({
        completeNodes: state.completeNodes,
        toolbarNodes: state.toolbarNodes,
        nodeConfigs: state.nodeConfigs,
      }),
    }
  )
);
