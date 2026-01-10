// draggableNode.js

import { GripVertical } from 'lucide-react';

export const DraggableNode = ({ type, label }) => {
    const onDragStart = (event, nodeType) => {
      const appData = { nodeType }
      event.target.style.cursor = 'grabbing';
      event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
      event.dataTransfer.effectAllowed = 'move';
    };
  
    return (
      <div
        className={`${type} group`}
        onDragStart={(event) => onDragStart(event, type)}
        onDragEnd={(event) => (event.target.style.cursor = 'grab')}
        style={{ 
          cursor: 'grab', 
          minWidth: '100px',
          height: '44px',
          width: 'fit-content',
          display: 'flex', 
          alignItems: 'center', 
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          justifyContent: 'center', 
          flexDirection: 'row',
          gap: '6px',
          padding: '0 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.08)',
          transition: 'all 0.2s ease',
        }} 
        draggable
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)';
        }}
      >
          <GripVertical 
            size={14} 
            style={{ 
              color: 'rgba(255,255,255,0.4)',
              flexShrink: 0,
            }} 
          />
          <span style={{ 
            color: '#fff', 
            fontSize: '13px', 
            fontWeight: 500,
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
          }}>
            {label}
          </span>
      </div>
    );
  };
