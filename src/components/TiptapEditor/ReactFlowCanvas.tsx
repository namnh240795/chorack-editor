import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlowProvider,
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getNodeTypesForDiagram, type DiagramType } from './nodes/NodeRegistry';

interface ReactFlowCanvasProps {
  flowId: string;
  nodes: Node[];
  edges: Edge[];
  width?: number;
  height?: number;
  diagramType?: DiagramType;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onNodeAdd?: (node: Node) => void;
}

function ReactFlowCanvasInner({
  nodes,
  edges,
  width,
  height,
  diagramType = 'erd',
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeAdd,
}: ReactFlowCanvasProps) {
  const { fitView } = useReactFlow();

  const onConnectCallback = useCallback(
    (connection: Connection) => {
      onConnect(connection);
    },
    [onConnect]
  );

  // Build nodeTypes based on diagramType
  const nodeTypes = useMemo(() => {
    return getNodeTypesForDiagram(diagramType);
  }, [diagramType]);

  // Handle double-click on canvas to add node
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && onNodeAdd && diagramType === 'erd') {
        // Only add node if clicking directly on the pane (not on an existing node)
        const reactFlowBounds = (event.target as Element).getBoundingClientRect();
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };

        // Simple prompt-based entity creation
        const entityName = window.prompt('Enter entity name:');
        if (entityName && entityName.trim()) {
          const newNode: Node = {
            id: `entity-${Date.now()}`,
            type: 'entity',
            position,
            data: {
              label: entityName.trim(),
              attributes: [
                {
                  name: 'id',
                  type: 'INT',
                  isPrimaryKey: true,
                  isForeignKey: false,
                  isNullable: false,
                },
              ],
            },
          };
          onNodeAdd(newNode);
        }
      }
    },
    [onNodeAdd, diagramType]
  );

  // Update ReactFlow viewport when dimensions change
  useEffect(() => {
    if (width && height) {
      // Small delay to ensure the DOM has updated
      const timer = setTimeout(() => {
        fitView({ duration: 150, padding: 0.1 });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [width, height, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnectCallback}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.2}
      maxZoom={2}
      fitViewOptions={{ padding: 0.1 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Background />
      <Controls />
      <MiniMap
        nodeColor={(node) => {
          switch (node.type) {
            case 'input':
              return '#93c5fd';
            case 'output':
              return '#fca5a5';
            case 'entity':
              return '#3b82f6';
            default:
              return '#d1d5db';
          }
        }}
      />
    </ReactFlow>
  );
}

export function ReactFlowCanvas(props: ReactFlowCanvasProps) {
  return (
    <div
      style={{ width: props.width, height: props.height, overflow: 'hidden', background: 'white', position: 'relative' }}
      data-testid="reactflow-canvas"
    >
      <ReactFlowProvider>
        <ReactFlowCanvasInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}

export type { Node, Edge };
