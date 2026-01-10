import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Handle } from 'reactflow';
import { useStore } from '../store';
import { useNodeDefinitionStore } from '../stores/nodeDefinitionStore';

// Dropdown styles
const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: 4,
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  zIndex: 1000,
  maxHeight: 150,
  overflowY: 'auto',
};

const dropdownItemStyle = {
  padding: '8px 12px',
  fontSize: 12,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  borderBottom: '1px solid #f3f4f6',
};

const dropdownItemHoverStyle = {
  ...dropdownItemStyle,
  backgroundColor: '#f3f4f6',
};

const variableBadgeStyle = {
  backgroundColor: '#dbeafe',
  color: '#1d4ed8',
  padding: '2px 6px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  fontFamily: 'monospace',
};

// Node type categories
const INPUT_NODE_TYPES = ['text', 'input', 'text_input', 'textinput'];
const LLM_NODE_TYPES = ['gemini', 'openai', 'llm', 'gpt', 'claude', 'mistral'];
const OUTPUT_NODE_TYPES = ['output', 'result'];

// Variable-aware textarea component with autocomplete
const VariableTextarea = ({ value, onChange, rows = 3, style, currentNodeId, currentNodeType, ...props }) => {
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const minRows = rows;

  // Get all nodes and addEdgeBetweenNodes from the store
  const nodes = useStore((state) => state.nodes);
  const addEdgeBetweenNodes = useStore((state) => state.addEdgeBetweenNodes);
  const completeNodes = useNodeDefinitionStore((state) => state.completeNodes);

  // Determine current node's category
  const currentNodeCategory = useMemo(() => {
    const nodeType = (currentNodeType || '').toLowerCase();
    if (LLM_NODE_TYPES.includes(nodeType)) return 'llm';
    if (OUTPUT_NODE_TYPES.includes(nodeType)) return 'output';
    return 'other';
  }, [currentNodeType]);

  // Filter input/text nodes for LLM variable suggestions
  const inputNodes = useMemo(() => {
    return nodes.filter(node => {
      const nodeType = (node.type || '').toLowerCase();
      return INPUT_NODE_TYPES.includes(nodeType);
    });
  }, [nodes]);

  // Filter LLM nodes for OUTPUT variable suggestions
  const llmNodes = useMemo(() => {
    return nodes.filter(node => {
      const nodeType = (node.type || '').toLowerCase();
      return LLM_NODE_TYPES.includes(nodeType);
    });
  }, [nodes]);

  // Select which nodes to show based on current node type
  const suggestableNodes = useMemo(() => {
    if (currentNodeCategory === 'llm') {
      // LLM nodes can reference INPUT nodes
      return inputNodes;
    } else if (currentNodeCategory === 'output') {
      // OUTPUT nodes can reference LLM nodes
      return llmNodes.length > 0 ? llmNodes : inputNodes;
    }
    // Default: show input nodes
    return inputNodes;
  }, [currentNodeCategory, inputNodes, llmNodes]);

  // Get appropriate label for dropdown
  const dropdownLabel = useMemo(() => {
    if (currentNodeCategory === 'output') {
      return 'Insert LLM Output';
    }
    return 'Insert Variable';
  }, [currentNodeCategory]);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 18;
    const padding = parseInt(getComputedStyle(textarea).paddingTop) + 
                    parseInt(getComputedStyle(textarea).paddingBottom) || 16;
    const minHeight = (lineHeight * minRows) + padding;
    const newHeight = Math.max(textarea.scrollHeight, minHeight);
    textarea.style.height = `${newHeight}px`;
  }, [minRows]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Check if we should show dropdown (when user types "{{")
  const checkForTrigger = useCallback((text, pos) => {
    const beforeCursor = text.slice(0, pos);
    const match = beforeCursor.match(/\{\{([^}]*)$/);
    if (match) {
      setShowDropdown(true);
      setHoveredIndex(0);
    } else {
      setShowDropdown(false);
    }
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    const pos = e.target.selectionStart;
    setCursorPosition(pos);
    checkForTrigger(newValue, pos);
    onChange(e);
    requestAnimationFrame(adjustHeight);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestableNodes.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHoveredIndex((prev) => Math.min(prev + 1, suggestableNodes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHoveredIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertVariable(suggestableNodes[hoveredIndex].id);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const insertVariable = (sourceNodeId) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = value || '';
    const pos = cursorPosition;
    
    // Find the start of "{{" before cursor
    const beforeCursor = text.slice(0, pos);
    const match = beforeCursor.match(/\{\{([^}]*)$/);
    
    if (match) {
      const startPos = pos - match[0].length;
      const variable = `{{${sourceNodeId}}}`;
      const newText = text.slice(0, startPos) + variable + text.slice(pos);
      
      // Create a synthetic event
      const syntheticEvent = {
        target: { value: newText }
      };
      onChange(syntheticEvent);
      
      // Automatically create edge between the source node and current node
      if (currentNodeId && addEdgeBetweenNodes) {
        addEdgeBetweenNodes(sourceNodeId, currentNodeId, completeNodes);
      }
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        const newPos = startPos + variable.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    }
    
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={minRows}
        style={{
          ...style,
          overflow: 'hidden',
          resize: 'none',
          minHeight: 'auto',
        }}
        {...props}
      />
      
      {showDropdown && suggestableNodes.length > 0 && (
        <div style={dropdownStyle}>
          <div style={{ padding: '6px 12px', fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
            {dropdownLabel}
          </div>
          {suggestableNodes.map((node, index) => {
            // Show different preview based on node type
            const nodeType = (node.type || '').toLowerCase();
            const isLlmNode = LLM_NODE_TYPES.includes(nodeType);
            const previewText = isLlmNode
              ? (node.data?.Prompt ? `"${node.data.Prompt.slice(0, 20)}${node.data.Prompt.length > 20 ? '...' : ''}"` : 'LLM Node')
              : (node.data?.text ? `"${node.data.text.slice(0, 20)}${node.data.text.length > 20 ? '...' : ''}"` : 'Empty');
            
            return (
              <div
                key={node.id}
                style={index === hoveredIndex ? dropdownItemHoverStyle : dropdownItemStyle}
                onMouseEnter={() => setHoveredIndex(index)}
                onClick={() => insertVariable(node.id)}
              >
                <span style={variableBadgeStyle}>{`{{${node.id}}}`}</span>
                <span style={{ color: '#6b7280', fontSize: 11 }}>
                  {previewText}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Auto-resizing textarea component (for non-variable fields)
const AutoResizeTextarea = ({ value, onChange, rows = 3, style, ...props }) => {
  const textareaRef = useRef(null);
  const minRows = rows;

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 18;
    const padding = parseInt(getComputedStyle(textarea).paddingTop) + 
                    parseInt(getComputedStyle(textarea).paddingBottom) || 16;
    const minHeight = (lineHeight * minRows) + padding;
    const newHeight = Math.max(textarea.scrollHeight, minHeight);
    textarea.style.height = `${newHeight}px`;
  }, [minRows]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = (e) => {
    onChange(e);
    requestAnimationFrame(adjustHeight);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      rows={minRows}
      style={{
        ...style,
        overflow: 'hidden',
        resize: 'none',
        minHeight: 'auto',
      }}
      {...props}
    />
  );
};

const baseCardStyle = {
  width: 240,
  minHeight: 110,
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
  background: '#fff',
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  fontWeight: 700,
  color: '#111827',
  fontSize: 14,
};

const descriptionStyle = {
  color: '#4b5563',
  fontSize: 12,
  lineHeight: 1.4,
};

const resultStyle = {
  marginTop: 8,
  padding: '10px 12px',
  backgroundColor: '#f0fdf4',
  border: '1px solid #22c55e',
  borderRadius: 8,
  fontSize: 12,
  color: '#166534',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  maxHeight: 200,
  overflowY: 'auto',
};

const fieldLabelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  color: '#111827',
  fontWeight: 600,
  fontSize: 12,
};

const inputStyle = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  fontSize: 12,
  color: '#111827',
  outline: 'none',
};

export const buildNodeComponent = (config) => {
  const Component = ({ id, data = {} }) => {
    const { updateNodeField } = useStore();

    const initialValues = useMemo(() => {
      const values = {};
      (config.fields || []).forEach((field) => {
        values[field.name] = data[field.name] ?? field.defaultValue ?? '';
      });
      return values;
    }, [data]);

    const [values, setValues] = useState(initialValues);

    useEffect(() => {
      setValues(initialValues);
    }, [initialValues]);

    const handleChange = (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      updateNodeField(id, name, value);
    };

    const headerAccent = config.accent || '#4f46e5';

    return (
      <div style={{ ...baseCardStyle, ...config.style }}>
        <div style={headerStyle}>
          <span>{config.title}</span>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: headerAccent }} />
        </div>

        {config.description ? <div style={descriptionStyle}>{config.description}</div> : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(config.fields || []).map((field) => (
            <label key={field.name} style={fieldLabelStyle}>
              {field.label}
              {field.type === 'select' ? (
                <select
                  value={values[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  style={inputStyle}
                >
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                field.supportsVariables ? (
                  <VariableTextarea
                    value={values[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={field.rows || 3}
                    style={inputStyle}
                    currentNodeId={id}
                    currentNodeType={config.type}
                  />
                ) : (
                  <AutoResizeTextarea
                    value={values[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={field.rows || 3}
                    style={inputStyle}
                  />
                )
              ) : (
                <input
                  type={field.type || 'text'}
                  value={values[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  style={inputStyle}
                />
              )}
            </label>
          ))}
          {config.renderContent ? config.renderContent({ id, data, values, onChange: handleChange }) : null}
        </div>

        {/* Display pipeline result if available */}
        {data._pipelineResult && (
          <div style={resultStyle}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#15803d' }}>
              Result:
            </div>
            {data._pipelineResult}
          </div>
        )}

        {(config.handles || []).map((handle) => (
          <Handle
            key={handle.id}
            type={handle.type}
            position={handle.position}
            id={`${id}-${handle.id}`}
            style={handle.style}
          />
        ))}
      </div>
    );
  };

  Component.displayName = `${config.title}Node`;
  return Component;
};

export const buildInitialData = (config) => {
  const initial = {};
  (config.fields || []).forEach((field) => {
    initial[field.name] = field.defaultValue ?? '';
  });
  return initial;
};
