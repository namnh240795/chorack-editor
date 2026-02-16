import { NodeViewWrapper } from '@tiptap/react';
import { ReactFlowWrapper } from '../ReactFlowWrapper';
import { useCallback, useState } from 'react';

interface ReactFlowNodeViewProps {
  node: {
    attrs: {
      flowId: string;
      width: number;
      height: number;
      diagramType?: string;
    };
  };
  updateAttributes: (attributes: Record<string, any>) => void;
  deleteNode: () => void;
}

export function ReactFlowNodeView(props: ReactFlowNodeViewProps) {
  const { flowId, width, height, diagramType } = props.node.attrs;
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  return (
    <NodeViewWrapper
      className="react-flow-node-wrapper relative inline-block my-4"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div
        className="relative w-full h-full border border-gray-300 rounded-lg overflow-hidden bg-gray-50"
        style={{ pointerEvents: isResizing ? 'none' : 'auto' }}
      >
        <ReactFlowWrapper
          flowId={flowId}
          width={width}
          height={height}
          diagramType={diagramType as any}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
        />
      </div>
    </NodeViewWrapper>
  );
}
