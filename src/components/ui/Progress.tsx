import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max = 100, size = 'md', variant = 'default', showLabel = false, className }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeStyles = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    const variantStyles = {
      default: 'bg-gradient-to-r from-indigo-500 to-violet-500',
      success: 'bg-gradient-to-r from-emerald-500 to-green-500',
      warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
      danger: 'bg-gradient-to-r from-rose-500 to-pink-500',
      info: 'bg-gradient-to-r from-sky-500 to-blue-500',
    };

    return (
      <div ref={ref} className={cn('w-full', className)}>
        <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              sizeStyles[size],
              variantStyles[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 text-right">
            {Math.round(percentage)}%
          </p>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Spinner = ({ size = 'md', variant = 'default', className }: SpinnerProps) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const variantStyles = {
    default: 'border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-300',
    primary: 'border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400',
    success: 'border-emerald-200 border-t-emerald-600 dark:border-emerald-800 dark:border-t-emerald-400',
    warning: 'border-amber-200 border-t-amber-600 dark:border-amber-800 dark:border-t-amber-400',
    danger: 'border-rose-200 border-t-rose-600 dark:border-rose-800 dark:border-t-rose-400',
  };

  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

export const CircularProgress = ({
  value,
  max = 100,
  size = 'md',
  strokeWidth = 8,
  variant = 'primary',
  showLabel = false,
  className,
}: CircularProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const sizeStyles = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const variantStyles = {
    default: 'text-slate-200 dark:text-slate-700 stroke-slate-600 dark:stroke-slate-300',
    primary: 'text-indigo-200 dark:text-indigo-800 stroke-indigo-600 dark:stroke-indigo-400',
    success: 'text-emerald-200 dark:text-emerald-800 stroke-emerald-600 dark:stroke-emerald-400',
    warning: 'text-amber-200 dark:text-amber-800 stroke-amber-600 dark:stroke-amber-400',
    danger: 'text-rose-200 dark:text-rose-800 stroke-rose-600 dark:stroke-rose-400',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        className={cn('transform -rotate-90', sizeStyles[size])}
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn(
            'text-slate-200 dark:text-slate-700',
            variantStyles[variant].split(' ')[0]
          )}
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-300 ease-out',
            variantStyles[variant].split(' ')[1]
          )}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'font-semibold',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-xl',
            'text-slate-900 dark:text-slate-100'
          )}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};
