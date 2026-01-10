import { Position } from 'reactflow';
import { buildInitialData, buildNodeComponent } from './nodeFactory';
import { useNodeDefinitionStore } from '../stores/nodeDefinitionStore';

// Mutable configs object that gets populated from API
let configs = {};

// Map string position values to ReactFlow Position enum
const positionMap = {
  right: Position.Right,
  left: Position.Left,
  top: Position.Top,
  bottom: Position.Bottom,
  Right: Position.Right,
  Left: Position.Left,
  Top: Position.Top,
  Bottom: Position.Bottom,
};

// Fields that should support variable interpolation ({{nodeId}})
const variableSupportedFields = ['prompt', 'query', 'message', 'input', 'output'];

// Transform backend node data to frontend config format
const transformNodeData = (node) => {
  return {
    type: node.type,
    title: node.title,
    label: node.label,
    description: node.description || '',
    accent: node.accent || '#4f46e5',
    fields: (node.fields || []).map((field) => ({
      ...field,
      // Enable variable support for prompt-like fields in LLM nodes
      supportsVariables: field.supportsVariables || 
        variableSupportedFields.includes(field.name?.toLowerCase()),
    })),
    handles: (node.handles || []).map((handle) => ({
      id: handle.id,
      type: handle.type,
      position: positionMap[handle.position] || Position.Right,
      ...(handle.style && { style: { top: `${handle.style.top}%` } }),
    })),
  };
};

// Mutable nodeTypes object that gets rebuilt after fetch
let _nodeTypes = {};

const rebuildNodeTypes = () => {
  _nodeTypes = Object.entries(configs).reduce((acc, [, cfg]) => {
    acc[cfg.type] = buildNodeComponent(cfg);
    return acc;
  }, {});
};

// Mutable toolbarNodes array that gets rebuilt after fetch
let _toolbarNodes = [];

const rebuildToolbarNodes = () => {
  _toolbarNodes = Object.values(configs).map((cfg) => ({
    type: cfg.type,
    label: cfg.label,
  }));
};

// Initialize node registry from fetched data
export const initializeNodeRegistry = (nodes) => {
  // Transform and populate configs object
  configs = {};
  nodes.forEach((node) => {
    configs[node.type] = transformNodeData(node);
  });

  // Rebuild nodeTypes and toolbarNodes after fetching
  rebuildNodeTypes();
  rebuildToolbarNodes();

  // Sync with Zustand store for persistence
  const store = useNodeDefinitionStore.getState();
  store.setToolbarNodes(_toolbarNodes);
  store.setNodeConfigs(configs);
};

// Fetch node definitions using zustand store
export const fetchNodeDefinitions = async () => {
  const store = useNodeDefinitionStore.getState();
  const result = await store.fetchNodeDefinitions();
  
  if (result.success) {
    initializeNodeRegistry(result.data);
  }
  
  return result;
};

// Getter for nodeTypes (returns current mutable value)
export const getNodeTypes = () => _nodeTypes;

// Getter for toolbarNodes (falls back to persisted Zustand store)
export const getToolbarNodes = () => {
  if (_toolbarNodes.length > 0) return _toolbarNodes;
  // Fall back to persisted store if mutable variable is empty
  return useNodeDefinitionStore.getState().toolbarNodes;
};

// Get initial data for a specific node type
export const getInitialDataForType = (type) => {
  const config = configs[type];
  if (!config) return {};
  return { nodeType: type, ...buildInitialData(config) };
};

// Getter for node config map (falls back to persisted Zustand store)
export const getNodeConfigMap = () => {
  if (Object.keys(configs).length > 0) return configs;
  // Fall back to persisted store if configs is empty
  return useNodeDefinitionStore.getState().nodeConfigs;
};

// Restore registry from persisted Zustand store (call on app startup)
export const restoreFromPersistedStore = () => {
  const store = useNodeDefinitionStore.getState();
  const persistedConfigs = store.nodeConfigs;
  const persistedToolbarNodes = store.toolbarNodes;

  // If we have persisted data and local state is empty, restore it
  if (Object.keys(persistedConfigs).length > 0 && Object.keys(configs).length === 0) {
    configs = persistedConfigs;
    rebuildNodeTypes();
    _toolbarNodes = persistedToolbarNodes;
    return true;
  }
  return false;
};
