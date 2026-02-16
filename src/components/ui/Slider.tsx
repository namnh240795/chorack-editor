import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange'> {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ 
    className, 
    label, 
    min = 0, 
    max = 100, 
    step = 1, 
    value: controlledValue,
    onChange,
    showValue = true,
    size = 'md',
    error,
    disabled,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(controlledValue ?? min);
    const value = controlledValue ?? internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    const percentage = ((value - min) / (max - min)) * 100;

    const sizeStyles = {
      sm: 'h-2',
      md: 'h-2.5',
      lg: 'h-3',
    };

    const thumbSizeStyles = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className="flex flex-col gap-2">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
              </label>
            )}
            
            {showValue && (
              <span className={cn(
                'text-sm font-mono',
                error 
                  ? 'text-rose-600 dark:text-rose-400' 
                  : 'text-slate-600 dark:text-slate-400'
              )}>
                {value}
              </span>
            )}
          </div>
        )}

        <div className="relative w-full">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              'absolute w-full h-full opacity-0 cursor-pointer z-10',
              disabled && 'cursor-not-allowed'
            )}
            {...props}
          />

          <div className="relative w-full">
            {/* Track Background */}
            <div
              className={cn(
                'w-full rounded-full overflow-hidden',
                'bg-slate-200 dark:bg-slate-700',
                error && 'bg-rose-200 dark:bg-rose-900',
                sizeStyles[size]
              )}
            >
              {/* Progress Fill */}
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-150',
                  'bg-gradient-to-r from-indigo-500 to-violet-500',
                  error && 'bg-gradient-to-r from-rose-500 to-pink-500'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Thumb */}
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 rounded-full border-2 border-white dark:border-slate-900',
                'shadow-md transition-all duration-150',
                'bg-gradient-to-br from-indigo-500 to-violet-500',
                error && 'bg-gradient-to-br from-rose-500 to-pink-500',
                'pointer-events-none',
                thumbSizeStyles[size]
              )}
              style={{ left: `calc(${percentage}% - ${size === 'sm' ? 8 : size === 'md' ? 10 : 12}px)` }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
