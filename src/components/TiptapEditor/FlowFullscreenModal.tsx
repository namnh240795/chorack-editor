import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ReactFlowCanvas, type Node, type Edge } from './ReactFlowCanvas';
import type { DiagramType } from './nodes/NodeRegistry';

interface FlowFullscreenModalProps {
  flowId: string;
  nodes: Node[];
  edges: Edge[];
  diagramType?: DiagramType;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeAdd?: (node: Node) => void;
  onClose: () => void;
}

export function FlowFullscreenModal({
  nodes,
  edges,
  diagramType = 'erd',
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeAdd,
  onClose,
}: FlowFullscreenModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-[90vw] h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">Flow Editor</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Done
          </button>
        </div>
        <div className="flex-1">
          <ReactFlowCanvas
            flowId="fullscreen"
            nodes={nodes}
            edges={edges}
            diagramType={diagramType}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeAdd={onNodeAdd}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
