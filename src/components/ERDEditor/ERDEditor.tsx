import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { EntityNode } from '../../components/TiptapEditor/nodes/EntityNode';
import { Database, Save, Trash2, Download, Upload, Plus, Maximize, Code2, ZoomIn, ZoomOut, Monitor, ChevronDown } from 'lucide-react';
import { Root as SelectRoot, Trigger, Value, Content, Item, ItemText } from '@radix-ui/react-select';
import { EntityFormModal, type EntityFormData } from './EntityFormModal';
import type { EdgeType } from './EdgeTypeSelector';
import { Button } from '../../components/ui/Button';
import { Tooltip } from '../../components/ui/Tooltip';
import { CustomEdge } from './CustomEdge';
import { YAMLEditorPanel } from '../../components/YAMLEditorPanel';
import { applyElkLayout, LayoutPresets } from '../../lib/elkLayout';
import { useToast } from '../ui/Toast';
import { formatChangeSummary, type DiagramChanges } from '@/lib/changeDetection';
import { showAlert } from '@/lib/useAlertDialog';

export type EdgeStyleType = 'smoothstep' | 'straight' | 'orthogonal';

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

const nodeTypes = {
  entity: EntityNode,
};

const edgeTypes = {
  custom: CustomEdge,
  default: CustomEdge,
};

// Custom Zoom Controls component
function CustomZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-2 flex flex-col gap-1">
        <Tooltip content="Zoom in" placement="right">
          <Button
            onClick={() => zoomIn({ duration: 300 })}
            variant="ghost"
            size="sm"
            className="!p-2 !w-9 !h-9"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </Tooltip>

        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

        <Tooltip content="Zoom out" placement="right">
          <Button
            onClick={() => zoomOut({ duration: 300 })}
            variant="ghost"
            size="sm"
            className="!p-2 !w-9 !h-9"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </Tooltip>

        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

        <Tooltip content="Fit all nodes in view" placement="right">
          <Button
            onClick={() => fitView({ duration: 300, padding: 0.2 })}
            variant="ghost"
            size="sm"
            className="!p-2 !w-9 !h-9"
          >
            <Monitor className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

interface ERDEditorProps {
  onSave?: (data: { nodes: Node[]; edges: Edge[] }, isAutoSave?: boolean) => void | Promise<void>;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export function ERDEditor({ onSave, initialNodes = [], initialEdges = [] }: ERDEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<EntityNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [pendingNodePosition, setPendingNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [editingNodeData, setEditingNodeData] = useState<EntityFormData | null>(null);
  const [selectedEdgeType] = useState<EdgeType>('1:N');
  const [selectedEdgeStyle, setSelectedEdgeStyle] = useState<EdgeStyleType>('smoothstep');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isYamlPanelOpen, setIsYamlPanelOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof LayoutPresets>('hierarchical');
  const [isLayouting, setIsLayouting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useToast();

  // Track previous state for change detection
  const previousNodesRef = useRef<string>(JSON.stringify(nodes));
  const previousEdgesRef = useRef<string>(JSON.stringify(edges));

  // Validate ERD data before saving
  const isValidERDData = useCallback((nodes: Node<EntityNodeData>[]): boolean => {
    return nodes.every(node => {
      if (node.type !== 'entity') return true;
      const data = node.data;
      // Check if entity has a valid name
      if (!data.label || data.label.trim() === '') return false;
      // Check if entity has at least one attribute
      if (!data.attributes || data.attributes.length === 0) return false;
      // Check if all attributes have valid names
      if (!data.attributes.every(attr => attr.name && attr.name.trim() !== '')) return false;
      return true;
    });
  }, []);

  // Deep comparison for change detection
  const hasDataChanged = useCallback((currentNodes: Node[], currentEdges: Edge[]): boolean => {
    const currentNodesStr = JSON.stringify(currentNodes);
    const currentEdgesStr = JSON.stringify(currentEdges);
    return currentNodesStr !== previousNodesRef.current || currentEdgesStr !== previousEdgesRef.current;
  }, []);

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

    const handleUpdateControlPoint = (e: Event) => {
      const detail = (e as CustomEvent).detail as { edgeId: string; x: number; y: number };
      // Coordinates are already transformed to flow coordinates in CustomEdge
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === detail.edgeId
            ? { ...edge, data: { ...edge.data, controlPoint: { x: detail.x, y: detail.y } } }
            : edge
        )
      );
    };

    const handleChangeEdgeStyle = (e: Event) => {
      const detail = (e as CustomEvent).detail as { edgeId: string; newStyle: EdgeStyleType };
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === detail.edgeId
            ? { ...edge, data: { ...edge.data, edgeStyle: detail.newStyle } }
            : edge
        )
      );
    };

    const handleUpdateLabelPosition = (e: Event) => {
      const detail = (e as CustomEvent).detail as { edgeId: string; x: number; y: number };
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === detail.edgeId
            ? { ...edge, data: { ...edge.data, labelPosition: { x: detail.x, y: detail.y } } }
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
          isUnique: attr.isUnique || false,
        })),
      });
      setIsEntityModalOpen(true);
    };

    // Register all event listeners
    window.addEventListener('delete-edge', handleDeleteEdge);
    window.addEventListener('change-edge-type', handleChangeEdgeType);
    window.addEventListener('update-edge-control-point', handleUpdateControlPoint);
    window.addEventListener('change-edge-style', handleChangeEdgeStyle);
    window.addEventListener('update-edge-label-position', handleUpdateLabelPosition);
    window.addEventListener('edit-entity', handleEditEntity);

    return () => {
      window.removeEventListener('delete-edge', handleDeleteEdge);
      window.removeEventListener('change-edge-type', handleChangeEdgeType);
      window.removeEventListener('update-edge-control-point', handleUpdateControlPoint);
      window.removeEventListener('change-edge-style', handleChangeEdgeStyle);
      window.removeEventListener('update-edge-label-position', handleUpdateLabelPosition);
      window.removeEventListener('edit-entity', handleEditEntity);
    };
  }, [setEdges]);

  // Handle canvas click - deselect nodes
  const onPaneClick = useCallback(() => {
    // Deselect nodes when clicking on canvas (handled by ReactFlow)
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
                    isUnique: attr.isUnique,
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
            isUnique: attr.isUnique || false,
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
      // Calculate default control point - will be updated when edge is rendered
      const edge = {
        ...connection,
        type: 'custom',
        label: selectedEdgeType,
        data: { 
          label: selectedEdgeType,
          edgeStyle: selectedEdgeStyle,
        },
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [selectedEdgeType, selectedEdgeStyle, setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback(() => {
    // Node selection is handled by ReactFlow
  }, []);

  // Delete selected nodes/edges
  const onDelete = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  // Clear all
  const onClear = useCallback(() => {
    if (confirm('Are you sure you want to clear the entire diagram?')) {
      setNodes([]);
      setEdges([]);
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
          showAlert({
            title: 'Import Failed',
            description: 'Invalid JSON file. Please check the file format and try again.',
          });
        }
      }
    };
    input.click();
  }, [setNodes, setEdges]);

  // Save diagram (manual save)
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({ nodes, edges }, false); // false = manual save
    }
  }, [nodes, edges, onSave]);

  // Auto layout using ELK
  const autoLayout = useCallback(async () => {
    setIsLayouting(true);
    try {
      if (nodes.length === 0) return;

      const { nodes: layoutedNodes } = await applyElkLayout(nodes, edges, LayoutPresets[selectedPreset]);
      setNodes(layoutedNodes);
    } catch (error) {
      console.error('Layout failed:', error);
      showAlert({
        title: 'Layout Failed',
        description: 'Could not apply automatic layout. Please check your diagram and try again.',
      });
    } finally {
      setIsLayouting(false);
    }
  }, [nodes, edges, selectedPreset, setNodes]);

  // Open entity modal at center or default position
  const handleAddEntity = useCallback(() => {
    setPendingNodePosition({ x: 400, y: 300 }); // Default center position
    setIsEntityModalOpen(true);
  }, []);

  // Handle diagram changes from YAML editor
  const handleDiagramChange = useCallback((newNodes: Node[], newEdges: Edge[], changes?: DiagramChanges) => {
    setNodes(newNodes);
    setEdges(newEdges);

    // Show toast notification if changes were detected
    if (changes && (changes.nodes.length > 0 || changes.edges.length > 0)) {
      const summary = formatChangeSummary(changes);
      toast.success(`YAML changes applied: ${summary}`, 4000);
    }
  }, [setNodes, setEdges, toast]);

  // Auto-save with debounce
  useEffect(() => {
    if (!onSave) return; // Only auto-save if onSave is provided

    // Check if data has actually changed
    if (!hasDataChanged(nodes, edges)) {
      return; // Skip save if no changes detected
    }

    // Validate data before saving
    if (!isValidERDData(nodes)) {
      console.log('Skipping auto-save: data validation failed');
      return; // Skip save if data is invalid
    }

    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);

    // Set up auto-save after 2 seconds of no changes
    autoSaveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        // Update refs before saving
        previousNodesRef.current = JSON.stringify(nodes);
        previousEdgesRef.current = JSON.stringify(edges);

        await onSave({ nodes, edges }, true); // true = auto-save
        setHasUnsavedChanges(false);
        setLastSavedAt(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    // Cleanup on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [nodes, edges, onSave, hasDataChanged, isValidERDData]);

  // MiniMap node color
  const nodeColor = useCallback((node: Node) => {
    if (node.type === 'entity') {
      return '#3b82f6';
    }
    return '#d1d5db';
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Toolbar - Single compact row */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Left: Branding */}
          <div className="flex items-center gap-2.5 pr-3 border-r border-slate-200 dark:border-slate-700">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Database className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">ERD Editor</h1>
            </div>
          </div>

          {/* Center: Tools */}
          <div className="flex items-center gap-2 flex-1">
            {/* Entity Tools */}
            <Tooltip content="Add a new entity/table to the diagram" placement="bottom">
              <Button
                onClick={handleAddEntity}
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                <span className="hidden md:inline">Add Entity</span>
              </Button>
            </Tooltip>

            <Tooltip content="Apply automatic layout to arrange entities" placement="bottom">
              <Button
                onClick={autoLayout}
                variant="outline"
                size="sm"
                leftIcon={<Maximize className="w-4 h-4" />}
                disabled={isLayouting}
              >
                <span className="hidden md:inline">{isLayouting ? 'Layouting...' : 'Layout'}</span>
              </Button>
            </Tooltip>

            {/* Layout Selector */}
            <div className="relative">
              <SelectRoot
                value={selectedPreset}
                onValueChange={(value) => setSelectedPreset(value as keyof typeof LayoutPresets)}
              >
                <Trigger className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-900 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 focus:border-indigo-500 hover:border-slate-400 dark:hover:border-slate-500 appearance-none cursor-pointer transition-all duration-200 hover:bg-white dark:hover:bg-slate-800 flex items-center min-w-[100px] h-[34px]">
                  <Value placeholder="Select layout" />
                  <ChevronDown className="w-4 h-4 ml-2 mr-1 opacity-50 shrink-0" />
                </Trigger>
                <Content className="z-50 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg">
                  <Item value="hierarchical" className="px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50">
                    <ItemText>Hierarchical</ItemText>
                  </Item>
                  <Item value="topDown" className="px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50">
                    <ItemText>Top Down</ItemText>
                  </Item>
                  <Item value="compact" className="px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50">
                    <ItemText>Compact</ItemText>
                  </Item>
                  <Item value="spacious" className="px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50">
                    <ItemText>Spacious</ItemText>
                  </Item>
                  <Item value="force" className="px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50">
                    <ItemText>Force</ItemText>
                  </Item>
                  <Item value="radial" className="px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50">
                    <ItemText>Radial</ItemText>
                  </Item>
                </Content>
              </SelectRoot>
            </div>

            {/* Edge Style Selector */}
            <div className="relative">
              <SelectRoot
                value={selectedEdgeStyle}
                onValueChange={(value) => setSelectedEdgeStyle(value as EdgeStyleType)}
              >
                <Trigger className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-900 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 focus:border-indigo-500 hover:border-slate-400 dark:hover:border-slate-500 appearance-none cursor-pointer transition-all duration-200 hover:bg-white dark:hover:bg-slate-800 flex items-center min-w-[110px] h-[34px]">
                  <Value placeholder="Edge style" />
                  <ChevronDown className="w-4 h-4 ml-2 mr-1 opacity-50 shrink-0" />
                </Trigger>
                <Content className="z-50 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg">
                  <Item value="smoothstep" className="px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50">
                    <ItemText>Smooth Step</ItemText>
                  </Item>
                  <Item value="straight" className="px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50">
                    <ItemText>Straight</ItemText>
                  </Item>
                  <Item value="orthogonal" className="px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50">
                    <ItemText>Orthogonal</ItemText>
                  </Item>
                </Content>
              </SelectRoot>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Edit Tools */}
            <Tooltip content="Delete selected (Delete key)" placement="bottom">
              <Button
                onClick={onDelete}
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                <span className="hidden lg:inline">Delete</span>
              </Button>
            </Tooltip>

            <Tooltip content="Clear all entities" placement="bottom">
              <Button
                onClick={onClear}
                variant="outline"
                size="sm"
              >
                <span className="hidden lg:inline">Clear</span>
              </Button>
            </Tooltip>
          </div>

          {/* Right: Stats & Actions */}
          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              <span><strong className="text-slate-900 dark:text-slate-100">{nodes.length}</strong> entities</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span><strong className="text-slate-900 dark:text-slate-100">{edges.length}</strong> relations</span>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

            {/* Save Status */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              {isSaving && (
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden lg:inline">Saving...</span>
                </div>
              )}
              {!isSaving && hasUnsavedChanges && (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="hidden lg:inline">Unsaved</span>
                </div>
              )}
              {!isSaving && !hasUnsavedChanges && lastSavedAt && (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="hidden lg:inline">Saved</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
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
      </div>

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
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          edgesUpdatable={true}
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

          {/* Custom Zoom Controls */}
          <CustomZoomControls />

          <MiniMap nodeColor={nodeColor} />
        </ReactFlow>
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
        currentNodeId={editingNodeId || undefined}
        allNodes={nodes}
        allEdges={edges}
        onEdgesChange={setEdges}
      />

      {/* YAML Editor Panel */}
      <YAMLEditorPanel
        isOpen={isYamlPanelOpen}
        onClose={() => setIsYamlPanelOpen(false)}
        nodes={nodes}
        edges={edges}
        onDiagramChange={handleDiagramChange}
        layoutType={selectedPreset}
      />
    </div>
  );
}
