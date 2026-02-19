import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string;
  label?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Standard input sizes - consistent across all form components
export const inputSizes = {
  sm: 'px-3 py-1.5 text-sm h-[34px]',
  md: 'px-4 py-2 text-base h-[42px]',
  lg: 'px-5 py-3 text-lg h-[50px]',
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    error,
    label,
    helperText,
    variant = 'default',
    size = 'md',
    leftIcon,
    rightIcon,
    id,
    ...props
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const variantStyles = {
      default: 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600',
      filled: 'bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500',
      outlined: 'bg-transparent border-2 border-slate-300 dark:border-slate-600',
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl transition-all duration-200',
              'text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                : 'hover:border-slate-400 dark:hover:border-slate-500 focus:border-indigo-500 focus:ring-indigo-500',
              variantStyles[variant],
              inputSizes[size],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {helperText && !error && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
        )}

        {error && (
          <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
