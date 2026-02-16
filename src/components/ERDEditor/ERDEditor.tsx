import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { EntityNode } from '../../components/TiptapEditor/nodes/EntityNode';
import { Database, Save, Trash2, Download, Upload, Plus, Maximize, Edit3, Link2, Code2 } from 'lucide-react';
import { EntityFormModal, type EntityFormData } from './EntityFormModal';
import type { EdgeType } from './EdgeTypeSelector';
import { Button } from '../../components/ui/Button';
import { Tooltip } from '../../components/ui/Tooltip';
import { CustomEdge } from './CustomEdge';
import { YAMLEditorPanel } from '../../components/YAMLEditorPanel';

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

const nodeTypes = {
  entity: EntityNode,
};

const edgeTypes = {
  custom: CustomEdge,
  default: CustomEdge,
};

interface ERDEditorProps {
  onSave?: (data: { nodes: Node[]; edges: Edge[] }) => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export function ERDEditor({ onSave, initialNodes = [], initialEdges = [] }: ERDEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<EntityNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [pendingNodePosition, setPendingNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [editingNodeData, setEditingNodeData] = useState<EntityFormData | null>(null);
  const [selectedEdgeType, setSelectedEdgeType] = useState<EdgeType>('1:N');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState<{ sourceId: string | null }>({ sourceId: null });
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isYamlPanelOpen, setIsYamlPanelOpen] = useState(false);

  // Handle custom events from CustomEdge component
  useEffect(() => {
    const handleDeleteEdge = (e: Event) => {
      const detail = (e as CustomEvent).detail as { edgeId: string };
      setEdges((eds) => eds.filter((edge) => edge.id !== detail.edgeId));
    };

    const handleChangeEdgeType = (e: Event) => {
      const detail = (e as CustomEvent).detail as { edgeId: string; newType: EdgeType };
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === detail.edgeId
            ? { ...edge, label: detail.newType, data: { label: detail.newType } }
            : edge
        )
      );
    };

    const handleEditEntity = (e: Event) => {
      const detail = (e as CustomEvent).detail as { nodeId: string; node: Node };
      setEditingNodeId(detail.nodeId);

      // Map entity types to form types with better fallback handling
      const mapToFormType = (type: string): string => {
        // Exact matches
        if (['INT', 'VARCHAR', 'TEXT', 'BOOLEAN', 'DATE', 'DATETIME', 'DECIMAL', 'JSON'].includes(type)) {
          return type;
        }

        // Common type mappings
        const typeMap: Record<string, string> = {
          'String': 'VARCHAR',
          'Number': 'DECIMAL',
          'Bool': 'BOOLEAN',
          'Int': 'INT',
        };

        // Try mapping
        if (typeMap[type]) {
          return typeMap[type];
        }

        // For types with length like VARCHAR(255) or TEXT, extract the base type
        const baseType = type.split('(')[0].toUpperCase();
        if (['INT', 'VARCHAR', 'TEXT', 'BOOLEAN', 'DATE', 'DATETIME', 'DECIMAL', 'JSON'].includes(baseType)) {
          return baseType;
        }

        // Default fallback
        return 'VARCHAR';
      };

      setEditingNodeData({
        name: detail.node.data.label,
        color: (detail.node.style as any)?.backgroundColor || '#ffffff',
        attributes: detail.node.data.attributes.map((attr: any) => ({
          name: attr.name,
          type: mapToFormType(attr.type),
          isPrimaryKey: attr.isPrimaryKey,
          isForeignKey: attr.isForeignKey,
          isNullable: attr.isNullable,
        })),
      });
      setIsEntityModalOpen(true);
    };

    window.addEventListener('delete-edge', handleDeleteEdge);
    window.addEventListener('change-edge-type', handleChangeEdgeType);
    window.addEventListener('edit-entity', handleEditEntity);

    return () => {
      window.removeEventListener('delete-edge', handleDeleteEdge);
      window.removeEventListener('change-edge-type', handleChangeEdgeType);
      window.removeEventListener('edit-entity', handleEditEntity);
    };
  }, [setEdges]);

  // Handle canvas click - deselect and cancel connection mode
  const onPaneClick = useCallback((event: React.MouseEvent) => {
    // Cancel connection mode if active
    if (connectionMode.sourceId) {
      setConnectionMode({ sourceId: null });
      return;
    }

    // Deselect nodes when clicking on canvas
    if (event.target === event.currentTarget) {
      setSelectedNodeId(null);
    }
  }, [connectionMode.sourceId]);

  // Handle connection mode - click to select source, then click target
  const handleConnectFromEntity = useCallback((entityId: string) => {
    if (!connectionMode.sourceId) {
      // First click - select as source
      setConnectionMode({ sourceId: entityId });
    } else if (connectionMode.sourceId === entityId) {
      // Clicked same entity - cancel
      setConnectionMode({ sourceId: null });
    } else {
      // Second click - create connection
      const edge = {
        id: `edge-${Date.now()}`,
        source: connectionMode.sourceId,
        target: entityId,
        type: 'custom',
        label: selectedEdgeType,
        data: { label: selectedEdgeType },
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      };
      setEdges((eds) => [...eds, edge]);
      setConnectionMode({ sourceId: null });
    }
  }, [connectionMode.sourceId, selectedEdgeType, setEdges]);

  const cancelConnectionMode = useCallback(() => {
    setConnectionMode({ sourceId: null });
  }, []);

  // Handle entity form submission
  const handleEntitySubmit = useCallback((data: EntityFormData & { color?: string }) => {
    const color = data.color || '#ffffff';

    // If editing existing node
    if (editingNodeId) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === editingNodeId
            ? {
                ...node,
                style: { ...node.style, backgroundColor: color },
                data: {
                  label: data.name,
                  attributes: data.attributes.map(attr => ({
                    name: attr.name,
                    type: attr.type,
                    isPrimaryKey: attr.isPrimaryKey,
                    isForeignKey: attr.isForeignKey,
                    isNullable: attr.isNullable,
                  })),
                },
              }
            : node
        )
      );
      setEditingNodeId(null);
      setEditingNodeData(null);
    } else if (pendingNodePosition) {
      // Creating new node
      const newNode: Node<EntityNodeData> = {
        id: `entity-${Date.now()}`,
        type: 'entity',
        position: pendingNodePosition,
        style: { backgroundColor: color },
        data: {
          label: data.name,
          attributes: data.attributes.map(attr => ({
            name: attr.name,
            type: attr.type,
            isPrimaryKey: attr.isPrimaryKey,
            isForeignKey: attr.isForeignKey,
            isNullable: attr.isNullable,
          })),
        },
      };
      setNodes((nds) => [...nds, newNode]);
      setPendingNodePosition(null);
    }
  }, [pendingNodePosition, editingNodeId, setNodes]);

  // Handle connection creation - use selected edge type
  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        ...connection,
        type: 'custom',
        label: selectedEdgeType,
        data: { label: selectedEdgeType },
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [selectedEdgeType, setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Check if we're in connection mode
    if (connectionMode.sourceId) {
      event.stopPropagation();
      handleConnectFromEntity(node.id);
    } else {
      setSelectedNodeId(node.id);
    }
  }, [connectionMode.sourceId, handleConnectFromEntity]);

  // Delete selected nodes/edges
  const onDelete = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  // Clear all
  const onClear = useCallback(() => {
    if (confirm('Are you sure you want to clear the entire diagram?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
    }
  }, [setNodes, setEdges]);

  // Export diagram
  const onExport = useCallback(() => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erd-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // Import diagram
  const onImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          if (data.nodes && data.edges) {
            setNodes(data.nodes);
            setEdges(data.edges);
          }
        } catch (err) {
          alert('Invalid JSON file');
        }
      }
    };
    input.click();
  }, [setNodes, setEdges]);

  // Save diagram
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({ nodes, edges });
    }
  }, [nodes, edges, onSave]);

  // Auto layout (simple grid layout)
  const autoLayout = useCallback(() => {
    if (nodes.length === 0) return;

    const columns = Math.ceil(Math.sqrt(nodes.length));
    const nodeWidth = 250;
    const nodeHeight = 200;
    const gap = 50;

    setNodes((nds) =>
      nds.map((node, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        return {
          ...node,
          position: {
            x: col * (nodeWidth + gap) + 50,
            y: row * (nodeHeight + gap) + 50,
          },
        };
      })
    );
  }, [nodes, setNodes]);

  // Open entity modal at center or default position
  const handleAddEntity = useCallback(() => {
    setPendingNodePosition({ x: 400, y: 300 }); // Default center position
    setIsEntityModalOpen(true);
  }, []);

  // Handle diagram changes from YAML editor
  const handleDiagramChange = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  // MiniMap node color
  const nodeColor = useCallback((node: Node) => {
    if (node.type === 'entity') {
      return '#3b82f6';
    }
    return '#d1d5db';
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm">
        {/* Top Row - Branding and Main Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">ERD Editor</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Design your database schema</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content="Save diagram" placement="bottom">
              <Button
                onClick={handleSave}
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Save</span>
              </Button>
            </Tooltip>

            <Tooltip content="Import diagram" placement="bottom">
              <Button
                onClick={onImport}
                variant="outline"
                size="sm"
                leftIcon={<Upload className="w-4 h-4" />}
              />
            </Tooltip>

            <Tooltip content="Export diagram" placement="bottom">
              <Button
                onClick={onExport}
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
              />
            </Tooltip>

            <Tooltip content="Open YAML Editor" placement="bottom">
              <Button
                onClick={() => setIsYamlPanelOpen(true)}
                variant="secondary"
                size="sm"
                leftIcon={<Code2 className="w-4 h-4" />}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-0 hover:from-indigo-600 hover:to-violet-700"
              >
                <span className="hidden sm:inline">YAML</span>
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Bottom Row - Tools Palette */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Entity Tools */}
          <div className="flex items-center gap-1 pr-3 border-r border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">Entities</span>

            <Tooltip content="Add Entity" placement="bottom">
              <Button
                onClick={handleAddEntity}
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                <span className="hidden lg:inline">Add Entity</span>
              </Button>
            </Tooltip>

            <Tooltip content="Auto Layout" placement="bottom">
              <Button
                onClick={autoLayout}
                variant="outline"
                size="sm"
                leftIcon={<Maximize className="w-4 h-4" />}
              >
                <span className="hidden lg:inline">Layout</span>
              </Button>
            </Tooltip>
          </div>

          {/* Connection Mode */}
          <div className="flex items-center gap-1 pr-3 border-r border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">Connect</span>
            
            <Tooltip content="Click two entities to connect them" placement="bottom">
              <Button
                onClick={() => {
                  if (connectionMode.sourceId) {
                    cancelConnectionMode();
                  } else {
                    setConnectionMode({ sourceId: null });
                  }
                }}
                variant={connectionMode.sourceId ? 'primary' : 'outline'}
                size="sm"
                leftIcon={<Link2 className="w-4 h-4" />}
                className={connectionMode.sourceId ? 'animate-pulse' : ''}
              >
                <span className="hidden lg:inline">
                  {connectionMode.sourceId ? 'Cancel Connect' : 'Connect Mode'}
                </span>
              </Button>
            </Tooltip>

            {connectionMode.sourceId && (
              <div className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-2 border border-indigo-200 dark:border-indigo-800">
                <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Select target entity
              </div>
            )}
          </div>

          {/* Relationship Tools */}
          <div className="flex items-center gap-1 pr-3 border-r border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">Relationships</span>

            <Button
              variant={selectedEdgeType === '1:1' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedEdgeType('1:1')}
            >
              1:1
            </Button>

            <Button
              variant={selectedEdgeType === '1:N' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedEdgeType('1:N')}
            >
              1:N
            </Button>

            <Button
              variant={selectedEdgeType === 'N:1' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedEdgeType('N:1')}
            >
              N:1
            </Button>

            <Button
              variant={selectedEdgeType === 'N:M' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedEdgeType('N:M')}
            >
              N:M
            </Button>
          </div>

          {/* Edit Tools */}
          <div className="flex items-center gap-1 pr-3 border-r border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">Edit</span>

            <Tooltip content="Edit selected entity (Click entity first)" placement="bottom">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit3 className="w-4 h-4" />}
                disabled={!selectedNodeId}
                onClick={() => {
                  const node = nodes.find(n => n.id === selectedNodeId);
                  if (node) {
                    setPendingNodePosition(node.position);
                    setIsEntityModalOpen(true);
                  }
                }}
              >
                <span className="hidden lg:inline">Edit</span>
              </Button>
            </Tooltip>

            <Tooltip content="Delete selected" placement="bottom">
              <Button
                onClick={onDelete}
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                <span className="hidden lg:inline">Delete</span>
              </Button>
            </Tooltip>

            <Tooltip content="Clear all" placement="bottom">
              <Button
                onClick={onClear}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </Tooltip>
          </div>

          {/* Info */}
          <div className="flex items-center gap-2 ml-auto text-xs text-slate-500 dark:text-slate-400">
            <span>Entities: <strong className="text-slate-900 dark:text-slate-100">{nodes.length}</strong></span>
            <span>•</span>
            <span>Relationships: <strong className="text-slate-900 dark:text-slate-100">{edges.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Instructions bar - Remove this as we have a comprehensive toolbar now */}

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'custom',
            style: { strokeWidth: 2, stroke: '#8b5cf6' },
            animated: false,
          }}
          deleteKeyCode="Delete"
          connectionLineStyle={{
            strokeWidth: 3,
            stroke: '#8b5cf6',
            strokeDasharray: '5,5',
          }}
          connectionLineType={ConnectionLineType.SmoothStep}
        >
          <Background />
          <Controls />
          <MiniMap nodeColor={nodeColor} />
        </ReactFlow>

        {/* Connection Mode Helper Overlay */}
        {connectionMode.sourceId && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">Connection Mode Active</p>
                <p className="text-xs text-indigo-100">Click another entity to create a relationship</p>
              </div>
              <button
                onClick={cancelConnectionMode}
                className="ml-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Entity Form Modal */}
      <EntityFormModal
        isOpen={isEntityModalOpen}
        onClose={() => {
          setIsEntityModalOpen(false);
          setEditingNodeId(null);
          setEditingNodeData(null);
        }}
        onSubmit={handleEntitySubmit}
        initialData={editingNodeData || undefined}
      />

      {/* YAML Editor Panel */}
      <YAMLEditorPanel
        isOpen={isYamlPanelOpen}
        onClose={() => setIsYamlPanelOpen(false)}
        nodes={nodes}
        edges={edges}
        onDiagramChange={handleDiagramChange}
      />
    </div>
  );
}
