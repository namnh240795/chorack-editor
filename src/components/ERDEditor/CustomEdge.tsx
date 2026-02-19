import { memo, useState, useCallback, useRef } from 'react';
import type { EdgeProps } from 'reactflow';
import {
  getMarkerEnd,
  EdgeLabelRenderer,
  BaseEdge,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import { cn } from '@/lib/utils';

export type EdgeType = '1:1' | '1:N' | 'N:1' | 'N:M';

interface CustomEdgeProps extends EdgeProps {
  data?: {
    label?: EdgeType;
    controlPoint?: { x: number; y: number };
    controlPoint2?: { x: number; y: number }; // Second control point for more complex curves
    edgeStyle?: 'smoothstep' | 'straight' | 'orthogonal';
    labelPosition?: { x: number; y: number };
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
    const { getViewport } = useReactFlow();
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const isDraggingControlPoint = useRef(false);

    const edgeType = (data?.label as EdgeType) || '1:N';
    const edgeStyleType = data?.edgeStyle || 'smoothstep';
    const edgeStyle = edgeTypeStyles[edgeType];

    // Get control point from edge data, or calculate default midpoint
    const controlPoint = data?.controlPoint || {
      x: (sourceX + targetX) / 2,
      y: (sourceY + targetY) / 2 - 50, // Default curve upward
    };

    // Get label position (default to control point if not set)
    const labelPosition = data?.labelPosition || controlPoint;

    // Create path based on edge style
    const edgePath = getEdgePath(edgeStyleType, sourceX, sourceY, targetX, targetY, controlPoint);

    function getEdgePath(
      style: string,
      sx: number,
      sy: number,
      tx: number,
      ty: number,
      cp: { x: number; y: number }
    ): string {
      const midX = cp.x;
      const midY = cp.y;

      if (style === 'straight') {
        return `M ${sx} ${sy} L ${tx} ${ty}`;
      }

      if (style === 'orthogonal') {
        // Orthogonal with 90-degree turns
        const midX = (sx + tx) / 2;
        return `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${tx} ${ty}`;
      }

      // Default smoothstep with rounded corners
      return `M ${sx} ${sy}
        L ${midX} ${sy}
        Q ${midX} ${midY}, ${midX} ${midY}
        L ${midX} ${ty}
        Q ${midX} ${ty}, ${tx} ${ty}
        L ${tx} ${ty}`;
    }

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

    const handleChangeStyle = (newStyle: 'smoothstep' | 'straight' | 'orthogonal') => {
      const changeEvent = new CustomEvent('change-edge-style', { detail: { edgeId: id, newStyle } });
      window.dispatchEvent(changeEvent);
      setContextMenu(null);
    };

    const handleControlPointMouseDown = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      isDraggingControlPoint.current = true;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const reactFlowWrapper = document.querySelector('.react-flow') as HTMLElement;
        if (!reactFlowWrapper) return;

        const reactFlowBounds = reactFlowWrapper.getBoundingClientRect();
        const viewport = getViewport();

        // Convert screen coordinates to flow coordinates (accounting for zoom and pan)
        const flowX = (moveEvent.clientX - reactFlowBounds.left - viewport.x) / viewport.zoom;
        const flowY = (moveEvent.clientY - reactFlowBounds.top - viewport.y) / viewport.zoom;

        const updateEvent = new CustomEvent('update-edge-control-point', {
          detail: { edgeId: id, x: flowX, y: flowY }
        });
        window.dispatchEvent(updateEvent);
      };

      const handleMouseUp = () => {
        isDraggingControlPoint.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }, [id, getViewport]);

    const handleLabelPositionDrag = useCallback((_position: 'start' | 'end', e: React.MouseEvent) => {
      if (!selected) return;

      e.stopPropagation();
      e.preventDefault();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const reactFlowWrapper = document.querySelector('.react-flow') as HTMLElement;
        if (!reactFlowWrapper) return;

        const reactFlowBounds = reactFlowWrapper.getBoundingClientRect();
        const viewport = getViewport();

        // Convert screen coordinates to flow coordinates (accounting for zoom and pan)
        const mouseX = (moveEvent.clientX - reactFlowBounds.left - viewport.x) / viewport.zoom;
        const mouseY = (moveEvent.clientY - reactFlowBounds.top - viewport.y) / viewport.zoom;

        // Calculate position along edge (0 to 1) based on mouse position
        let t = 0.5; // Default to middle
        let constrainedX = mouseX;
        let constrainedY = mouseY;

        if (edgeStyleType === 'straight') {
          // For straight lines, use projection
          const dx = targetX - sourceX;
          const dy = targetY - sourceY;
          const lengthSq = dx * dx + dy * dy;
          if (lengthSq > 0) {
            t = ((mouseX - sourceX) * dx + (mouseY - sourceY) * dy) / lengthSq;
            t = Math.max(0, Math.min(1, t));
            constrainedX = sourceX + t * dx;
            constrainedY = sourceY + t * dy;
          }
        } else if (edgeStyleType === 'orthogonal') {
          // For orthogonal edges, track mouse along the edge path
          const totalLength = Math.abs(targetX - sourceX) + Math.abs(targetY - sourceY);
          
          if (totalLength > 0) {
            // Approximate position based on distance from source
            const distToSource = Math.abs(mouseX - sourceX) + Math.abs(mouseY - sourceY);
            const distToTarget = Math.abs(mouseX - targetX) + Math.abs(mouseY - targetY);
            
            // Normalize to 0-1 range
            t = distToSource / (distToSource + distToTarget);
            t = Math.max(0, Math.min(1, t));
            
            // Interpolate along the orthogonal path
            const midX = (sourceX + targetX) / 2;
            
            if (Math.abs(targetX - sourceX) > Math.abs(targetY - sourceY)) {
              // Horizontal dominant
              if (t < 0.5) {
                const segT = t * 2;
                constrainedX = sourceX + (midX - sourceX) * segT;
                constrainedY = sourceY;
              } else {
                const segT = (t - 0.5) * 2;
                constrainedX = midX + (targetX - midX) * segT;
                constrainedY = targetY;
              }
            } else {
              // Vertical dominant
              const midY = (sourceY + targetY) / 2;
              if (t < 0.5) {
                const segT = t * 2;
                constrainedX = sourceX;
                constrainedY = sourceY + (midY - sourceY) * segT;
              } else {
                const segT = (t - 0.5) * 2;
                constrainedX = targetX;
                constrainedY = midY + (targetY - midY) * segT;
              }
            }
          }
        } else {
          // Smoothstep edges
          const cpX = controlPoint.x;
          
          // Calculate approximate path length
          const seg1Len = Math.abs(cpX - sourceX);
          const seg2Len = Math.abs(targetY - sourceY);
          const seg3Len = Math.abs(targetX - cpX);
          const totalLen = seg1Len + seg2Len + seg3Len;
          
          if (totalLen > 0) {
            // Approximate position based on distance from source
            const distToSource = Math.abs(mouseX - sourceX) + Math.abs(mouseY - sourceY);
            const distToTarget = Math.abs(mouseX - targetX) + Math.abs(mouseY - targetY);
            
            t = distToSource / (distToSource + distToTarget);
            t = Math.max(0, Math.min(1, t));
            
            // Interpolate along smoothstep path
            const t1 = seg1Len / totalLen;
            const t2 = (seg1Len + seg2Len) / totalLen;
            
            if (t < t1) {
              const segT = t / t1;
              constrainedX = sourceX + (cpX - sourceX) * segT;
              constrainedY = sourceY;
            } else if (t < t2) {
              const segT = (t - t1) / (t2 - t1);
              constrainedX = cpX;
              constrainedY = sourceY + (targetY - sourceY) * segT;
            } else {
              const segT = (t - t2) / (1 - t2);
              constrainedX = cpX + (targetX - cpX) * segT;
              constrainedY = targetY;
            }
          }
        }

        const updateEvent = new CustomEvent('update-edge-label-position', {
          detail: { edgeId: id, x: constrainedX, y: constrainedY }
        });
        window.dispatchEvent(updateEvent);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }, [id, selected, getViewport, sourceX, sourceY, targetX, targetY, edgeStyleType, controlPoint]);

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

          {/* Control point handle - visible when selected */}
          {selected && edgeStyleType !== 'straight' && (
            <g
              style={{ cursor: 'grab' }}
              onMouseDown={handleControlPointMouseDown}
            >
              <circle
                cx={controlPoint.x}
                cy={controlPoint.y}
                r={6}
                fill="#8b5cf6"
                stroke="white"
                strokeWidth={2}
                className="hover:r-8 transition-all duration-200"
              />
            </g>
          )}

          {/* Label position handles - visible when selected */}
          {selected && (
            <>
              {/* Start handle */}
              <g
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => handleLabelPositionDrag('start', e)}
              >
                <circle
                  cx={sourceX}
                  cy={sourceY}
                  r={5}
                  fill="#f59e0b"
                  stroke="white"
                  strokeWidth={2}
                  className="hover:r-7 transition-all duration-200 opacity-80 hover:opacity-100"
                />
              </g>
              {/* End handle */}
              <g
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => handleLabelPositionDrag('end', e)}
              >
                <circle
                  cx={targetX}
                  cy={targetY}
                  r={5}
                  fill="#f59e0b"
                  stroke="white"
                  strokeWidth={2}
                  className="hover:r-7 transition-all duration-200 opacity-80 hover:opacity-100"
                />
              </g>
            </>
          )}

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
              transform: `translate(-50%, -50%) translate(${labelPosition.x}px, ${labelPosition.y}px)`,
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

              {/* Edge Style */}
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Edge Style
              </div>
              <button
                onClick={() => handleChangeStyle('smoothstep')}
                className={cn(
                  'w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-sm',
                  edgeStyleType === 'smoothstep' && 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                Smooth Step
              </button>
              <button
                onClick={() => handleChangeStyle('straight')}
                className={cn(
                  'w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-sm',
                  edgeStyleType === 'straight' && 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20L20 4" />
                </svg>
                Straight
              </button>
              <button
                onClick={() => handleChangeStyle('orthogonal')}
                className={cn(
                  'w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-sm',
                  edgeStyleType === 'orthogonal' && 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h4l2-4 2 8 2-4h4" />
                </svg>
                Orthogonal
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
