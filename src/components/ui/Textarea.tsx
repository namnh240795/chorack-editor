import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
  size?: 'sm' | 'md' | 'lg';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, showCharacterCount = false, maxLength, size = 'md', value, ...props }, ref) => {
    const characterCount = typeof value === 'string' ? value.length : 0;

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full rounded-xl border transition-all duration-200 resize-y min-h-[80px]',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950',
            'bg-white dark:bg-slate-900',
            'text-slate-900 dark:text-slate-100',
            'placeholder:text-slate-400 dark:placeholder:text-slate-600',
            error
              ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
              : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:border-indigo-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            sizeStyles[size],
            className
          )}
          {...props}
        />

        <div className="flex items-center justify-between">
          {helperText && !error && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
          )}
          
          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}

          {showCharacterCount && maxLength && (
            <p className={cn(
              'text-xs ml-auto',
              characterCount > maxLength * 0.9 
                ? 'text-rose-600 dark:text-rose-400' 
                : 'text-slate-500 dark:text-slate-400'
            )}>
              {characterCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
