import { memo, useState } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from 'reactflow';
import type { Node } from 'reactflow';

export interface Attribute {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
}

export interface EntityNodeData {
  label: string;
  attributes: Attribute[];
}

export const EntityNode = memo(({ data, selected, id }: NodeProps<EntityNodeData>) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<number | null>(null);
  const [editedLabel, setEditedLabel] = useState(data.label);
  const [editedAttributes, setEditedAttributes] = useState(data.attributes);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const { setNodes, getNodes } = useReactFlow();

  const hasPrimaryKey = data.attributes.some((attr) => attr.isPrimaryKey);

  // Get node color from style
  const node = getNodes().find(n => n.id === id);
  const bgColor = (node?.style as any)?.backgroundColor || '#ffffff';

  // Determine if we're in dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Color palette
  const COLOR_PALETTE = [
    { name: 'Yellow', value: '#fef3c7' },
    { name: 'Red', value: '#fecaca' },
    { name: 'Teal', value: '#99f6e4' },
    { name: 'White', value: '#ffffff' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Purple', value: '#e9d5ff' },
    { name: 'Pink', value: '#fbcfe8' },
  ];

  // Helper to create solid color by mixing with white/black
  const createSolidColor = (hex: string, intensity: number) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    if (isDarkMode) {
      // Dark mode: mix the color with dark background
      const darkBase = 30; // slate-900
      const factor = intensity;
      const finalR = Math.round(r * factor + darkBase * (1 - factor));
      const finalG = Math.round(g * factor + darkBase * (1 - factor));
      const finalB = Math.round(b * factor + darkBase * (1 - factor));
      return `rgb(${finalR}, ${finalG}, ${finalB})`;
    } else {
      // Light mode: mix the color with white background
      const whiteBase = 255;
      const factor = intensity;
      const finalR = Math.round(r * factor + whiteBase * (1 - factor));
      const finalG = Math.round(g * factor + whiteBase * (1 - factor));
      const finalB = Math.round(b * factor + whiteBase * (1 - factor));
      return `rgb(${finalR}, ${finalG}, ${finalB})`;
    }
  };

  // Determine if using a non-white color
  const isColored = bgColor.toLowerCase() !== '#ffffff';

  // Calculate colors based on selection
  const headerBgColor = isColored ? createSolidColor(bgColor, 0.5) : 'transparent';
  const rowBgColor = isColored ? createSolidColor(bgColor, 0.25) : 'transparent';
  const rowHoverBgColor = isColored ? createSolidColor(bgColor, 0.35) : 'rgba(0, 0, 0, 0.03)';

  // Border remains visible for node definition
  const borderColor = isDarkMode ? 'rgb(71, 85, 105)' : 'rgb(226, 232, 240)';

  // Handle inline name editing
  const handleNameDoubleClick = () => {
    setIsEditingName(true);
    setEditedLabel(data.label);
  };

  const handleNameSave = () => {
    if (editedLabel.trim()) {
      setNodes((nodes: Node[]) =>
        nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, label: editedLabel.trim() } }
            : node
        )
      );
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setEditedLabel(data.label);
    }
  };

  // Handle inline attribute editing
  const handleAttributeDoubleClick = (index: number) => {
    setEditingAttribute(index);
    setEditedAttributes([...data.attributes]);
  };

  const handleAttributeSave = () => {
    setNodes((nodes: Node[]) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, attributes: editedAttributes } }
          : node
      )
    );
    setEditingAttribute(null);
  };

  const handleAttributeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAttributeSave();
    } else if (e.key === 'Escape') {
      setEditingAttribute(null);
      setEditedAttributes(data.attributes);
    }
  };

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
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              // Position menu to the right of the button, vertically centered
              setContextMenu({ x: rect.right + 8, y: rect.top + rect.height / 2 - 10 });
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
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onDoubleClick={handleNameDoubleClick}
          title="Double-click to edit name"
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: headerBgColor,
              }}
            >
              {hasPrimaryKey ? (
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </div>

            {/* Name */}
            {isEditingName ? (
              <input
                type="text"
                value={editedLabel}
                onChange={(e) => setEditedLabel(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleNameKeyDown}
                autoFocus
                className="flex-1 px-3 py-1.5 text-sm font-bold bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-slate-100"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="flex-1 text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {data.label}
              </span>
            )}

            {/* Entity count badge */}
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
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
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s',
                backgroundColor: rowBgColor,
                backgroundImage: 'none',
              }}
              onDoubleClick={() => handleAttributeDoubleClick(index)}
              title="Double-click to edit attribute"
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
                    className="px-1.5 py-0.5 rounded text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    title="Primary Key"
                  >
                    PK
                  </span>
                )}
                {attr.isForeignKey && (
                  <span 
                    className="px-1.5 py-0.5 rounded text-xs font-semibold bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800"
                    title="Foreign Key"
                  >
                    FK
                  </span>
                )}
              </div>

              {/* Attribute name */}
              {editingAttribute === index ? (
                <input
                  type="text"
                  value={editedAttributes[index].name}
                  onChange={(e) => {
                    const newAttrs = [...editedAttributes];
                    newAttrs[index].name = e.target.value;
                    setEditedAttributes(newAttrs);
                  }}
                  onBlur={handleAttributeSave}
                  onKeyDown={handleAttributeKeyDown}
                  autoFocus
                  className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-slate-100 font-medium"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span 
                  className="flex-1 font-medium text-slate-800 dark:text-slate-200"
                  style={{ fontWeight: attr.isPrimaryKey ? '700' : '500' }}
                >
                  {attr.name}
                </span>
              )}

              {/* Attribute type */}
              {editingAttribute === index ? (
                <select
                  value={editedAttributes[index].type}
                  onChange={(e) => {
                    const newAttrs = [...editedAttributes];
                    newAttrs[index].type = e.target.value;
                    setEditedAttributes(newAttrs);
                  }}
                  className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="String">String</option>
                  <option value="Number">Number</option>
                  <option value="Boolean">Boolean</option>
                  <option value="Date">Date</option>
                  <option value="Text">Text</option>
                </select>
              ) : (
                <span 
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                >
                  {attr.type}
                </span>
              )}

              {/* Nullable indicator */}
              {attr.isNullable && (
                <span 
                  className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold"
                  title="Nullable"
                >
                  ?
                </span>
              )}

              {/* Edit hint */}
              {editingAttribute !== index && (
                <span className="absolute right-2 opacity-0 group-hover:opacity-50 text-slate-400 dark:text-slate-400 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
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
        </>
      )}
    </>
  );
});

EntityNode.displayName = 'EntityNode';
