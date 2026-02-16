import type { ReactNode } from 'react';
import { useState, useRef, useEffect, isValidElement } from 'react';
import { cn } from '@/lib/utils';

interface PopoverProps {
  content: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  offset?: number;
  className?: string;
}

export const Popover = ({
  content,
  children,
  isOpen: controlledIsOpen,
  onOpenChange,
  placement = 'bottom',
  align = 'center',
  offset = 8,
  className,
}: PopoverProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen ?? internalIsOpen;

  const handleToggle = () => {
    const newState = !isOpen;
    if (!controlledIsOpen) {
      setInternalIsOpen(newState);
    }
    onOpenChange?.(newState);
  };

  const handleClose = () => {
    if (!controlledIsOpen) {
      setInternalIsOpen(false);
    }
    onOpenChange?.(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        popoverRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const placementStyles: Record<string, string> = {
    'top-start': 'bottom-full left-0 mb-2',
    'top-center': 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    'top-end': 'bottom-full right-0 mb-2',
    'bottom-start': 'top-full left-0 mt-2',
    'bottom-center': 'top-full left-1/2 -translate-x-1/2 mt-2',
    'bottom-end': 'top-full right-0 mt-2',
    'left-start': 'right-full top-0 mr-2',
    'left-center': 'right-full top-1/2 -translate-y-1/2 mr-2',
    'left-end': 'right-full bottom-0 mr-2',
    'right-start': 'left-full top-0 ml-2',
    'right-center': 'left-full top-1/2 -translate-y-1/2 ml-2',
    'right-end': 'left-full bottom-0 ml-2',
  };

  const placementKey = `${placement}-${align}`;
  const currentPlacement = placementStyles[placementKey] || placementStyles['bottom-center'];

  const childElement = isValidElement(children) ? children : null;

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        onClick={handleToggle}
        className="inline-block"
      >
        {childElement}
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className={cn(
            'absolute z-50 w-max',
            'bg-white dark:bg-slate-900',
            'border border-slate-200 dark:border-slate-700',
            'rounded-xl shadow-xl',
            'animate-fade-in',
            currentPlacement,
            className
          )}
          style={{ [placement === 'top' ? 'bottom' : placement === 'left' ? 'right' : placement === 'right' ? 'left' : 'top']: `calc(100% + ${offset}px)` }}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      )}
    </div>
  );
};

interface PopoverContentProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const PopoverContent = ({ children, className, padding = 'md' }: PopoverContentProps) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className={cn(paddingStyles[padding], className)}>
      {children}
    </div>
  );
};

interface PopoverHeaderProps {
  children: ReactNode;
  className?: string;
}

export const PopoverHeader = ({ children, className }: PopoverHeaderProps) => {
  return (
    <div className={cn('border-b border-slate-200 dark:border-slate-700 px-4 py-3', className)}>
      {children}
    </div>
  );
};

interface PopoverFooterProps {
  children: ReactNode;
  className?: string;
}

export const PopoverFooter = ({ children, className }: PopoverFooterProps) => {
  return (
    <div className={cn('border-t border-slate-200 dark:border-slate-700 px-4 py-3', className)}>
      {children}
    </div>
  );
};
