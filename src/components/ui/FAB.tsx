import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FABProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  isExtended?: boolean;
  icon?: React.ReactNode;
  label?: string;
}

export const FAB = forwardRef<HTMLButtonElement, FABProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    position = 'bottom-right',
    isExtended = false,
    icon,
    label,
    className,
    children,
    ...props 
  }, ref) => {
    const variantStyles = {
      primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25',
      secondary: 'bg-slate-600 hover:bg-slate-700 text-white shadow-lg',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/25',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25',
    };

    const sizeStyles = {
      sm: 'w-12 h-12',
      md: 'w-14 h-14',
      lg: 'w-16 h-16',
    };

    const positionStyles = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'fixed z-40 rounded-full flex items-center justify-center',
          'transition-all duration-200',
          'hover:scale-110 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-950',
          variantStyles[variant],
          !isExtended && sizeStyles[size],
          isExtended && 'h-14 px-6',
          positionStyles[position],
          className
        )}
        {...props}
      >
        <span className="flex items-center gap-2">
          {icon || children}
          {isExtended && label && (
            <span className="font-medium">{label}</span>
          )}
        </span>
      </button>
    );
  }
);

FAB.displayName = 'FAB';
