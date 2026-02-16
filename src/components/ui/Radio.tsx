import type { InputHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, size = 'md', ...props }, ref) => {
    const id = useId();

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
      <label
        htmlFor={id}
        className={cn(
          'flex items-center gap-2 cursor-pointer',
          props.disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          id={id}
          type="radio"
          ref={ref}
          className={cn(
            'rounded-full border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950',
            'bg-white dark:bg-slate-900',
            error
              ? 'border-rose-500 focus:ring-rose-500'
              : 'border-slate-300 dark:border-slate-600',
            'hover:border-indigo-400 dark:hover:border-indigo-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'appearance-none cursor-pointer relative',
            'checked:border-indigo-500 checked:bg-indigo-500',
            'after:content-[""] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2',
            'after:bg-white after:rounded-full',
            sizeStyles[size],
            size === 'sm' ? 'after:w-1.5 after:h-1.5' : size === 'md' ? 'after:w-2 after:h-2' : 'after:w-2.5 after:h-2.5',
            className
          )}
          {...props}
        />
        
        <span className={cn(
          'text-slate-700 dark:text-slate-300 select-none',
          labelSizeStyles[size]
        )}>
          {label}
        </span>
      </label>
    );
  }
);

Radio.displayName = 'Radio';

interface RadioGroupProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
  orientation?: 'vertical' | 'horizontal';
}

const RadioGroup = ({ label, error, children, orientation = 'vertical' }: RadioGroupProps) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      
      <div className={cn(
        'flex gap-4',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
      )}>
        {children}
      </div>

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
};

export { Radio, RadioGroup };
