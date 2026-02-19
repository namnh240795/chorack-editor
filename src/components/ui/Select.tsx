import * as React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ className, options, value, onChange, placeholder = 'Select...', disabled = false, error, size = 'md', ...props }, ref) => {
    return (
      <div className={cn('relative', className)}>
        <RadixSelect.Root
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          {...props}
        >
          <RadixSelect.Trigger
            ref={ref}
            className={cn(
              'flex items-center justify-between w-full rounded-xl border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950',
              'bg-white dark:bg-slate-900',
              error
                ? 'border-rose-500 dark:border-rose-500'
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500',
              disabled && 'opacity-50 cursor-not-allowed',
              sizeStyles[size]
            )}
          >
            <RadixSelect.Value placeholder={placeholder} />
            <RadixSelect.Icon className="ml-2">
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-slate-400 transition-transform duration-200'
                )}
              />
            </RadixSelect.Icon>
          </RadixSelect.Trigger>

          <RadixSelect.Portal>
            <RadixSelect.Content
              className={cn(
                'overflow-hidden bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600',
                'rounded-xl shadow-lg',
                'max-h-60 overflow-y-auto',
                'z-50',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
              )}
              position="popper"
              sideOffset={4}
            >
              <RadixSelect.Viewport
                className={cn(
                  'p-1',
                  size === 'sm' && 'text-sm',
                  size === 'md' && 'text-base',
                  size === 'lg' && 'text-lg'
                )}
              >
                {options.map((option) => (
                  <RadixSelect.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(
                      'relative flex items-center px-4 py-2 rounded-lg',
                      'cursor-pointer transition-colors duration-150',
                      'focus:outline-none focus:bg-indigo-50 dark:focus:bg-indigo-950',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      !option.disabled && 'hover:bg-slate-100 dark:hover:bg-slate-800',
                      'data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900 font-medium'
                    )}
                  >
                    <RadixSelect.ItemText>
                      {option.label}
                    </RadixSelect.ItemText>
                    <RadixSelect.ItemIndicator className="absolute right-4">
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </RadixSelect.ItemIndicator>
                  </RadixSelect.Item>
                ))}
              </RadixSelect.Viewport>
            </RadixSelect.Content>
          </RadixSelect.Portal>
        </RadixSelect.Root>

        {error && (
          <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export type { SelectOption, SelectProps };
