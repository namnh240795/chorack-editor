import { cn } from '@/lib/utils';
import { inputSizes } from './Input';

export interface SelectTriggerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  hasIcon?: boolean;
}

// Standard Radix Select Trigger styling - matches Input component
export function getSelectTriggerClassName({
  className = '',
  size = 'md',
  error = false,
  hasIcon = false
}: SelectTriggerProps = {}) {
  return cn(
    // Base styles - match Input component
    'flex items-center justify-between',
    'w-full',
    'rounded-xl',
    'transition-all duration-200',
    'bg-white dark:bg-slate-900',
    'text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950',
    'border border-slate-300 dark:border-slate-600',
    'hover:border-slate-400 dark:hover:border-slate-500',
    'focus:border-indigo-500 focus:ring-indigo-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    // Error state
    error && 'border-rose-500 dark:border-rose-500 focus:ring-rose-500 focus:border-rose-500',
    // Size-specific styles - match Input component exactly
    inputSizes[size],
    // Icon spacing
    hasIcon && 'pr-10',
    // Cursor
    'cursor-pointer',
    // Custom className
    className
  );
}
