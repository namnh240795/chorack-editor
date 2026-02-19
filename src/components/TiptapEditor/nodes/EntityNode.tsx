import { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, type NodeProps, useReactFlow } from 'reactflow';
import type { Node } from 'reactflow';

export interface Attribute {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
  isUnique: boolean;
}

export interface EntityNodeData {
  label: string;
  attributes: Attribute[];
}

export const EntityNode = memo(({ data, selected, id }: NodeProps<EntityNodeData>) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const { setNodes, getNodes } = useReactFlow();

  // Get node color from style
  const node = getNodes().find(n => n.id === id);
  const bgColor = (node?.style as any)?.backgroundColor || '#ffffff';

  // Determine if we're in dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Color palette - saturated/darker colors
  const COLOR_PALETTE = [
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
  ];

  // All colors are now colored (no white/transparent option)
  const isColored = true;

  // Calculate colors based on reference image pattern
  const headerBgColor = bgColor;

  // Attribute rows use a consistent dark color (like navy #2c3e50 in reference)
  const rowBgColor = isDarkMode ? 'rgb(30, 41, 59)' : 'rgb(44, 62, 80)';
  const rowHoverBgColor = isDarkMode ? 'rgb(51, 65, 85)' : 'rgb(52, 73, 94)';

  // Border color - darker for navy theme
  const borderColor = isColored
    ? (isDarkMode ? 'rgb(51, 65, 85)' : 'rgb(33, 47, 61)')
    : (isDarkMode ? 'rgb(71, 85, 105)' : 'rgb(226, 232, 240)');

  // Text colors based on reference image
  const headerTextColor = isColored ? '#ffffff' : (isDarkMode ? '#f1f5f9' : '#0f172a');
  const attributeTextColor = isDarkMode ? '#e2e8f0' : '#ecf0f1';

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    setNodes((nodes: Node[]) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, style: { ...node.style, backgroundColor: color } }
          : node
      )
    );
    setShowColorPicker(false);
    setContextMenu(null);
  };

  const handleContextMenuAction = (action: 'edit' | 'duplicate' | 'delete') => {
    const node = getNodes().find((n) => n.id === id);
    if (!node) return;

    switch (action) {
      case 'edit':
        const editEvent = new CustomEvent('edit-entity', { detail: { nodeId: id, node } });
        window.dispatchEvent(editEvent);
        break;
      case 'duplicate':
        const newNode: Node<EntityNodeData> = {
          ...node,
          id: `entity-${Date.now()}`,
          position: { x: node.position.x + 50, y: node.position.y + 50 },
        };
        setNodes((nodes: Node[]) => [...nodes, newNode]);
        break;
      case 'delete':
        setNodes((nodes: Node[]) => nodes.filter((n) => n.id !== id));
        break;
    }
    setContextMenu(null);
  };

  return (
    <>
      <div
        className="entity-node group relative transition-all duration-200"
        style={{
          backgroundColor: 'transparent',
          borderRadius: '12px',
          minWidth: '240px',
          maxWidth: '320px',
          boxShadow: selected
            ? '0 0 0 3px rgba(99, 102, 241, 0.4), 0 8px 24px rgba(0, 0, 0, 0.15)'
            : isHovered
              ? '0 8px 20px rgba(0, 0, 0, 0.12)'
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
          border: '1px solid',
          borderColor: selected
            ? `rgba(99, 102, 241, 0.5)`
            : borderColor,
          backgroundImage: 'none',
        }}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Quick Actions Button */}
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();

              // Get the entity node's position
              const entityNode = (e.currentTarget as HTMLElement).closest('.react-flow__node');
              if (!entityNode) return;

              const entityRect = entityNode.getBoundingClientRect();

              // Position menu at the entity's right edge (not the click position)
              const MENU_WIDTH = 224;
              const MENU_HEIGHT = 200;
              const OFFSET = 2; // Small gap between entity and menu

              // Calculate position
              let menuX = entityRect.right + OFFSET;
              let menuY = entityRect.top;

              // If not enough space on the right, show on the left
              if (menuX + MENU_WIDTH > window.innerWidth) {
                menuX = entityRect.left - MENU_WIDTH - OFFSET;
              }

              // Ensure menu stays within viewport vertically
              if (menuY + MENU_HEIGHT > window.innerHeight) {
                menuY = window.innerHeight - MENU_HEIGHT - OFFSET;
              }
              if (menuY < OFFSET) {
                menuY = OFFSET;
              }

              setContextMenu({ x: menuX, y: menuY });
            }}
            onContextMenu={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseDown={(e) => {
              // Prevent mouseDown from triggering other handlers
              e.stopPropagation();
              e.preventDefault();
            }}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all duration-200 shadow-sm border border-slate-200 dark:border-slate-700"
            style={{ opacity: isHovered ? '1' : '0' }}
          >
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        )}

        {/* Entity Header */}
        <div
          className="entity-header"
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid',
            borderColor: borderColor,
            backgroundColor: headerBgColor,
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            transition: 'all 0.2s',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Name */}
            <span
              className="flex-1 text-base font-bold truncate"
              style={{ color: headerTextColor }}
            >
              {data.label}
            </span>

            {/* Entity count badge */}
            <span
              className="px-2 py-1 text-xs font-semibold rounded-full border"
              style={{
                backgroundColor: isColored ? 'rgba(255, 255, 255, 0.2)' : (isDarkMode ? 'rgb(30, 41, 59)' : 'rgb(241, 245, 249)'),
                color: headerTextColor,
                borderColor: isColored ? 'rgba(255, 255, 255, 0.3)' : (isDarkMode ? 'rgb(51, 65, 85)' : 'rgb(226, 232, 240)')
              }}
            >
              {data.attributes.length}
            </span>
          </div>
        </div>

        {/* Attributes List */}
        <div className="attributes-list" style={{ padding: '0' }}>
          {data.attributes.map((attr, index) => (
            <div
              key={index}
              className="group/attr"
              style={{
                padding: '12px 16px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: index < data.attributes.length - 1
                  ? borderColor
                  : 'none',
                position: 'relative',
                transition: 'all 0.15s',
                backgroundColor: rowBgColor,
                backgroundImage: 'none',
                borderBottomLeftRadius: index === data.attributes.length - 1 ? '12px' : '0',
                borderBottomRightRadius: index === data.attributes.length - 1 ? '12px' : '0',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = rowHoverBgColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = rowBgColor;
              }}
            >
              {/* Connection Handle - Left (Source) */}
              <Handle
                type="source"
                position={Position.Left}
                id={`${id}-${attr.name}-source`}
                style={{
                  background: isDarkMode ? '#1e293b' : '#ffffff',
                  border: `2px solid ${attr.isForeignKey ? '#8b5cf6' : '#94a3b8'}`,
                  width: isHovered ? '12px' : '10px',
                  height: isHovered ? '12px' : '10px',
                  transition: 'all 0.2s',
                  left: '-6px',
                  opacity: isHovered || attr.isForeignKey ? '1' : '0.6',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                }}
                className="hover:scale-125"
              />

              {/* Connection Handle - Right (Target) */}
              <Handle
                type="target"
                position={Position.Right}
                id={`${id}-${attr.name}-target`}
                style={{
                  background: isDarkMode ? '#1e293b' : '#ffffff',
                  border: `2px solid ${attr.isPrimaryKey ? '#3b82f6' : '#94a3b8'}`,
                  width: isHovered ? '12px' : '10px',
                  height: isHovered ? '12px' : '10px',
                  transition: 'all 0.2s',
                  right: '-6px',
                  opacity: isHovered ? '1' : '0.6',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                }}
                className="hover:scale-125"
              />
              {/* Attribute icons */}
              <div style={{ display: 'flex', gap: '4px', minWidth: '40px', justifyContent: 'center' }}>
                {attr.isPrimaryKey && (
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: '#f1c40f',
                      color: '#1a1a1a',
                      border: 'none'
                    }}
                    title="Primary Key"
                  >
                    PK
                  </span>
                )}
                {attr.isForeignKey && (
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: '#3498db',
                      color: '#ffffff',
                      border: 'none'
                    }}
                    title="Foreign Key"
                  >
                    FK
                  </span>
                )}
                {attr.isUnique && (
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: '#3498db',
                      color: '#ffffff',
                      border: 'none'
                    }}
                    title="Unique"
                  >
                    U
                  </span>
                )}
              </div>

              {/* Attribute name */}
              <span
                className="flex-1 font-medium"
                style={{
                  color: attributeTextColor,
                  fontWeight: attr.isPrimaryKey ? '700' : '500'
                }}
              >
                {attr.name}
              </span>

              {/* Attribute type */}
              <span
                className="px-2.5 py-1 text-xs font-semibold rounded-md font-mono"
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: attributeTextColor,
                  border: 'none'
                }}
              >
                {attr.type}
              </span>

              {/* Nullable indicator */}
              {attr.isNullable && (
                <span
                  className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                    color: attributeTextColor,
                  }}
                  title="Nullable"
                >
                  ?
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu - Rendered at document.body to avoid ReactFlow transforms */}
      {contextMenu && createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setContextMenu(null);
              setShowColorPicker(false);
            }}
          />
          <div
            className="fixed z-50 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 animate-scale-in"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
          >
            <button
              onClick={() => handleContextMenuAction('edit')}
              className="w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Entity
            </button>
            <button
              onClick={() => handleContextMenuAction('duplicate')}
              className="w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Duplicate
            </button>

            {/* Color Picker Section */}
            <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Color
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${showColorPicker ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showColorPicker && (
              <div className="px-3 pb-2 grid grid-cols-4 gap-2">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value)}
                    className="w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{
                      backgroundColor: color.value,
                      borderColor: bgColor.toLowerCase() === color.value.toLowerCase() ? 'rgb(99, 102, 241)' : 'rgb(226, 232, 240)',
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            )}

            <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />
            <button
              onClick={() => handleContextMenuAction('delete')}
              className="w-full px-4 py-2.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center gap-3 text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
});

EntityNode.displayName = 'EntityNode';
