import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  snapPoints?: (number | string)[];
  defaultSnap?: number;
  className?: string;
}

export const BottomSheet = ({
  isOpen,
  onClose,
  children,
  snapPoints = ['80%'],
  defaultSnap = 0,
  className,
}: BottomSheetProps) => {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startSnap = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startSnap.current = currentSnap;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const deltaY = e.touches[0].clientY - startY.current;
    const sheetHeight = sheetRef.current?.offsetHeight || 0;
    const deltaPercent = (deltaY / sheetHeight) * 100;

    const newSnap = startSnap.current + deltaPercent;
    setCurrentSnap(Math.max(0, Math.min(newSnap, 100)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Find nearest snap point
    const snapPointsNumeric = snapPoints.map((p) => (typeof p === 'string' ? parseFloat(p) : p));
    const nearestSnap = snapPointsNumeric.reduce((prev, curr) => {
      return Math.abs(curr - currentSnap) < Math.abs(prev - currentSnap) ? curr : prev;
    });

    setCurrentSnap(nearestSnap);

    // Close if dragged below threshold
    if (currentSnap > 70) {
      onClose();
      setCurrentSnap(defaultSnap);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center">
        <div
          ref={sheetRef}
          className={cn(
            'w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl',
            'transition-transform duration-200 ease-out',
            className
          )}
          style={{
            transform: `translateY(${100 - currentSnap}%)`,
            maxHeight: snapPoints[0] === '100%' ? '100vh' : snapPoints[0],
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag Handle */}
          <div className="flex justify-center py-4 touch-none">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
          </div>

          {/* Content */}
          <div className="px-6 pb-6 overflow-y-auto max-h-[calc(100vh-100px)]">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

interface BottomSheetHeaderProps {
  children: ReactNode;
  className?: string;
}

export const BottomSheetHeader = ({ children, className }: BottomSheetHeaderProps) => {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
};

interface BottomSheetTitleProps {
  children: ReactNode;
  className?: string;
}

export const BottomSheetTitle = ({ children, className }: BottomSheetTitleProps) => {
  return (
    <h2 className={cn('text-xl font-bold text-slate-900 dark:text-slate-100', className)}>
      {children}
    </h2>
  );
};

interface BottomSheetContentProps {
  children: ReactNode;
  className?: string;
}

export const BottomSheetContent = ({ children, className }: BottomSheetContentProps) => {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
};
