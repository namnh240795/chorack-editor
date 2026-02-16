import { useCallback, useEffect, useState } from 'react';
import { ReactFlowCanvas } from './ReactFlowCanvas';
import { ResizeHandle } from './ResizeHandle';
import { FlowFullscreenModal } from './FlowFullscreenModal';
import { useFlowPersistence } from '../../hooks/useFlowPersistence';
import type { DiagramType } from './nodes/NodeRegistry';

interface ReactFlowWrapperProps {
  flowId: string;
  width: number;
  height: number;
  diagramType?: DiagramType;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

export function ReactFlowWrapper({
  flowId,
  width,
  height,
  diagramType = 'erd',
  onResizeStart,
  onResizeEnd,
}: ReactFlowWrapperProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDim, setStartDim] = useState({ width, height });

  const { nodes, edges, setNodes, onNodesChange, onEdgesChange, onConnect } =
    useFlowPersistence(flowId);

  const handleResizeStart = useCallback(
    (direction: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeDirection(direction);
      setStartPos({ x: e.clientX, y: e.clientY });
      setStartDim(dimensions);
      onResizeStart();
    },
    [dimensions, onResizeStart]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeDirection) return;

      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      let newWidth = startDim.width;
      let newHeight = startDim.height;

      // Handle each direction
      if (resizeDirection.includes('e')) {
        newWidth = startDim.width + deltaX;
      }
      if (resizeDirection.includes('w')) {
        newWidth = startDim.width - deltaX;
      }
      if (resizeDirection.includes('s')) {
        newHeight = startDim.height + deltaY;
      }
      if (resizeDirection.includes('n')) {
        newHeight = startDim.height - deltaY;
      }

      // Apply constraints
      newWidth = Math.max(300, Math.min(1200, newWidth));
      newHeight = Math.max(200, Math.min(800, newHeight));

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        setResizeDirection(null);
        onResizeEnd();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, startPos, startDim, onResizeEnd]);

  const handleFullscreenOpen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  const handleFullscreenClose = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  const handleNodeAdd = useCallback(
    (node: any) => {
      setNodes((nds) => [...nds, node]);
    },
    [setNodes]
  );

  return (
    <>
      <div
        className="relative"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          display: 'inline-block',
          verticalAlign: 'top'
        }}
      >
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <button
            onClick={handleFullscreenOpen}
            className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-xs"
            title="Fullscreen"
            data-testid="fullscreen-button"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>

          <ReactFlowCanvas
            flowId={flowId}
            nodes={nodes}
            edges={edges}
            width={dimensions.width}
            height={dimensions.height}
            diagramType={diagramType}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeAdd={handleNodeAdd}
          />

          {!isResizing && (
            <>
              <ResizeHandle direction="n" onResizeStart={handleResizeStart} />
              <ResizeHandle direction="s" onResizeStart={handleResizeStart} />
              <ResizeHandle direction="e" onResizeStart={handleResizeStart} />
              <ResizeHandle direction="w" onResizeStart={handleResizeStart} />
              <ResizeHandle direction="ne" onResizeStart={handleResizeStart} />
              <ResizeHandle direction="nw" onResizeStart={handleResizeStart} />
              <ResizeHandle direction="se" onResizeStart={handleResizeStart} />
              <ResizeHandle direction="sw" onResizeStart={handleResizeStart} />
            </>
          )}
        </div>

      {isFullscreen && (
        <FlowFullscreenModal
          flowId={flowId}
          nodes={nodes}
          edges={edges}
          diagramType={diagramType}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeAdd={handleNodeAdd}
          onClose={handleFullscreenClose}
        />
      )}
    </>
  );
}
