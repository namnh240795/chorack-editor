import type { ComponentProps } from 'react';
import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps extends Omit<ComponentProps<'input'>, 'type' | 'size'> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, size = 'md', disabled, ...props }, ref) => {
    const id = useId();

    const sizeStyles = {
      sm: {
        track: 'w-10 h-6',
        thumb: 'w-4 h-4',
        translate: 'translate-x-4',
      },
      md: {
        track: 'w-12 h-7',
        thumb: 'w-5 h-5',
        translate: 'translate-x-5',
      },
      lg: {
        track: 'w-14 h-8',
        thumb: 'w-6 h-6',
        translate: 'translate-x-6',
      },
    };

    const currentSize = sizeStyles[size];

    return (
      <label
        htmlFor={id}
        className={cn(
          'flex items-center gap-3 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="relative">
          <input
            id={id}
            type="checkbox"
            ref={ref}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          
          <div
            className={cn(
              'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-slate-950',
              'bg-slate-200 dark:bg-slate-700 peer-checked:bg-indigo-500',
              'rounded-full transition-all duration-200 ease-in-out',
              'relative cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed',
              currentSize.track,
              className
            )}
          >
            <div
              className={cn(
                'bg-white shadow-md rounded-full transition-all duration-200 ease-in-out',
                'absolute top-1/2 -translate-y-1/2 left-0.5',
                'peer-checked:translate-x-full',
                currentSize.thumb
              )}
            />
          </div>
        </div>

        {label && (
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
