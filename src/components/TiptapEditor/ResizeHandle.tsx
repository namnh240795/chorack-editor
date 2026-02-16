import type { CSSProperties } from 'react';

interface ResizeHandleProps {
  direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
  onResizeStart: (direction: string, e: React.MouseEvent) => void;
}

const handleStyles: Record<string, CSSProperties> = {
  n: {
    top: '-4px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '8px',
    cursor: 'ns-resize',
  },
  s: {
    bottom: '-4px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '8px',
    cursor: 'ns-resize',
  },
  e: {
    right: '-4px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '8px',
    height: '40px',
    cursor: 'ew-resize',
  },
  w: {
    left: '-4px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '8px',
    height: '40px',
    cursor: 'ew-resize',
  },
  ne: {
    top: '-4px',
    right: '-4px',
    width: '12px',
    height: '12px',
    cursor: 'nesw-resize',
  },
  nw: {
    top: '-4px',
    left: '-4px',
    width: '12px',
    height: '12px',
    cursor: 'nwse-resize',
  },
  se: {
    bottom: '-4px',
    right: '-4px',
    width: '12px',
    height: '12px',
    cursor: 'nwse-resize',
  },
  sw: {
    bottom: '-4px',
    left: '-4px',
    width: '12px',
    height: '12px',
    cursor: 'nesw-resize',
  },
};

export function ResizeHandle({ direction, onResizeStart }: ResizeHandleProps) {
  const style = handleStyles[direction];

  return (
    <div
      className="absolute z-10 hover:bg-blue-400/30 rounded-sm transition-colors"
      style={style}
      onMouseDown={(e) => onResizeStart(direction, e)}
      data-testid={`resize-handle-${direction}`}
    />
  );
}
