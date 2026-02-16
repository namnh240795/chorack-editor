import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, size = 'md', indeterminate, ...props }, ref) => {
    const sizeStyles = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const labelSizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    return (
      <div className="flex flex-col gap-1">
        <label className={cn(
          'flex items-center gap-2 cursor-pointer',
          props.disabled && 'opacity-50 cursor-not-allowed'
        )}>
          <input
            type="checkbox"
            ref={ref}
            className={cn(
              'rounded border-2 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950',
              'bg-white dark:bg-slate-900',
              error
                ? 'border-rose-500 checked:bg-rose-500 focus:ring-rose-500'
                : 'border-slate-300 dark:border-slate-600 checked:bg-indigo-500 checked:border-indigo-500',
              'hover:border-indigo-400 dark:hover:border-indigo-500',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'appearance-none cursor-pointer relative',
              sizeStyles[size],
              className
            )}
            {...props}
          />
          
          {label && (
            <span className={cn(
              'text-slate-700 dark:text-slate-300 select-none',
              labelSizeStyles[size]
            )}>
              {label}
            </span>
          )}
        </label>

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400 pl-6">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
