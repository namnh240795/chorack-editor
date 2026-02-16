import type { KeyboardEvent } from 'react';
import { forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ className, options, value, onChange, placeholder = 'Select...', disabled = false, error, size = 'md', ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const selectRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (option: SelectOption) => {
      if (!option.disabled) {
        onChange?.(option.value);
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            handleSelect(options[highlightedIndex]);
          } else {
            setIsOpen(!isOpen);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) => {
              const next = prev + 1;
              if (next >= options.length) return 0;
              return next;
            });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => {
              const next = prev - 1;
              if (next < 0) return options.length - 1;
              return next;
            });
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    };

    useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && listRef.current) {
        const items = listRef.current.querySelectorAll('li:not([disabled])');
        if (items[highlightedIndex]) {
          items[highlightedIndex].scrollIntoView({ block: 'nearest' });
        }
      }
    }, [highlightedIndex, isOpen]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    const listSizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          selectRef.current = node;
        }}
        className={cn('relative', className)}
        {...props}
      >
        <div
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-disabled={disabled}
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
          onKeyDown={handleKeyDown}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={cn(!selectedOption && 'text-slate-400 dark:text-slate-600')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={cn(
              'w-5 h-5 text-slate-400 transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {error && (
          <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p>
        )}

        {isOpen && (
          <ul
            ref={listRef}
            role="listbox"
            className={cn(
              'absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600',
              'rounded-xl shadow-lg overflow-hidden',
              'max-h-60 overflow-y-auto',
              listSizeStyles[size]
            )}
          >
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                className={cn(
                  'px-4 py-2 cursor-pointer transition-colors duration-150',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  !option.disabled && 'hover:bg-slate-100 dark:hover:bg-slate-800',
                  highlightedIndex === options.indexOf(option) && !option.disabled && 'bg-indigo-50 dark:bg-indigo-950',
                  value === option.value && 'bg-indigo-100 dark:bg-indigo-900 font-medium'
                )}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
