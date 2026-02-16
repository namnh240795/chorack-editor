import { memo, useState } from 'react';
import type { EdgeProps } from 'reactflow';
import {
  getBezierPath,
  getMarkerEnd,
  EdgeLabelRenderer,
  BaseEdge,
  Position,
  MarkerType,
} from 'reactflow';
import { cn } from '@/lib/utils';

export type EdgeType = '1:1' | '1:N' | 'N:1' | 'N:M';

interface CustomEdgeProps extends EdgeProps {
  data?: {
    label?: EdgeType;
  };
}

const edgeTypeStyles: Record<EdgeType, { color: string; dashArray: string; strokeWidth: number }> = {
  '1:1': {
    color: '#3b82f6', // blue
    dashArray: '0',
    strokeWidth: 2,
  },
  '1:N': {
    color: '#8b5cf6', // violet
    dashArray: '0',
    strokeWidth: 2.5,
  },
  'N:1': {
    color: '#8b5cf6', // violet
    dashArray: '0',
    strokeWidth: 2.5,
  },
  'N:M': {
    color: '#ec4899', // pink
    dashArray: '5,5',
    strokeWidth: 3,
  },
};

export const CustomEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, selected, data, style }: CustomEdgeProps) => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    
    const edgeType = (data?.label as EdgeType) || '1:N';
    const edgeStyle = edgeTypeStyles[edgeType];

    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      targetX,
      targetY,
    });

    const markerEnd = getMarkerEnd(MarkerType.ArrowClosed);

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleDelete = () => {
      // Trigger edge deletion via ReactFlow
      const deleteEvent = new CustomEvent('delete-edge', { detail: { edgeId: id } });
      window.dispatchEvent(deleteEvent);
      setContextMenu(null);
    };

    const handleChangeType = (newType: EdgeType) => {
      const changeEvent = new CustomEvent('change-edge-type', { detail: { edgeId: id, newType } });
      window.dispatchEvent(changeEvent);
      setContextMenu(null);
    };

    // Calculate label position (middle of the path)
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    return (
      <>
        <g
          className={cn(
            'react-flow__edge group',
            'transition-all duration-200',
            selected && 'react-flow__edge-selected'
          )}
          style={{ cursor: 'pointer' }}
          onContextMenu={handleContextMenu}
        >
          {/* Main edge path */}
          <BaseEdge
            id={id}
            path={edgePath}
            style={{
              ...style,
              stroke: edgeStyle.color,
              strokeWidth: edgeStyle.strokeWidth,
              strokeDasharray: edgeStyle.dashArray,
              filter: selected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' : undefined,
            }}
            markerEnd={markerEnd}
          />

          {/* Hover overlay (invisible but wider for easier clicking) */}
          <path
            d={edgePath}
            fill="none"
            stroke="transparent"
            strokeWidth={20}
            className="hover:stroke-blue-500/10 transition-all duration-200"
            style={{ cursor: 'pointer' }}
          />
        </g>

        {/* Edge Label */}
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)`,
              pointerEvents: 'all',
            }}
            className={cn(
              'px-2 py-1 text-xs font-semibold rounded-lg transition-all duration-200',
              'bg-white dark:bg-slate-900',
              'border-2 shadow-sm',
              selected
                ? 'border-indigo-500 shadow-md scale-110'
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300',
              edgeType === '1:1' && 'text-blue-600 dark:text-blue-400',
              edgeType === '1:N' && 'text-violet-600 dark:text-violet-400',
              edgeType === 'N:1' && 'text-violet-600 dark:text-violet-400',
              edgeType === 'N:M' && 'text-pink-600 dark:text-pink-400'
            )}
            onContextMenu={handleContextMenu}
          >
            {edgeType}
          </div>
        </EdgeLabelRenderer>

        {/* Context Menu */}
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setContextMenu(null)}
            />
            <div
              className="fixed z-50 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 animate-scale-in"
              style={{
                left: `${contextMenu.x}px`,
                top: `${contextMenu.y}px`,
              }}
            >
              {/* Change Relationship Type */}
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Relationship Type
              </div>
              <button
                onClick={() => handleChangeType('1:1')}
                className={cn(
                  'w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-sm',
                  edgeType === '1:1' && 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                )}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                One to One (1:1)
              </button>
              <button
                onClick={() => handleChangeType('1:N')}
                className={cn(
                  'w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-sm',
                  edgeType === '1:N' && 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400'
                )}
              >
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                One to Many (1:N)
              </button>
              <button
                onClick={() => handleChangeType('N:1')}
                className={cn(
                  'w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-sm',
                  edgeType === 'N:1' && 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400'
                )}
              >
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Many to One (N:1)
              </button>
              <button
                onClick={() => handleChangeType('N:M')}
                className={cn(
                  'w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-sm',
                  edgeType === 'N:M' && 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400'
                )}
              >
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Many to Many (N:M)
              </button>
              
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
              
              {/* Delete */}
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Relationship
              </button>
            </div>
          </>
        )}
      </>
    );
  }
);

CustomEdge.displayName = 'CustomEdge';
