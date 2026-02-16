import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success' | 'warning' | 'info' | 'link' | 'gradient-purple' | 'gradient-pink';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isFullWidth?: boolean;
  isSquared?: boolean;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 focus:ring-indigo-500 dark:from-indigo-500 dark:to-violet-500',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500 dark:text-slate-300 dark:hover:bg-slate-800',
  danger: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25 focus:ring-rose-500',
  outline: 'border-2 border-slate-300 dark:border-slate-600 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-500 dark:text-slate-300 dark:hover:bg-slate-800',
  success: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25 focus:ring-emerald-500',
  warning: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 focus:ring-amber-500',
  info: 'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-lg shadow-sky-500/25 focus:ring-sky-500',
  link: 'bg-transparent text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 focus:ring-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950 underline-offset-4 hover:underline',
  'gradient-purple': 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 focus:ring-purple-500',
  'gradient-pink': 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25 focus:ring-pink-500',
};

const sizeStyles = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading, 
    disabled,
    leftIcon,
    rightIcon,
    isFullWidth,
    isSquared,
    children, 
    onClick,
    ...props 
  }, ref) => {
    const [rippleCoords, setRippleCoords] = useState<{ x: number; y: number } | null>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;

      // Create ripple effect
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setRippleCoords({ x, y });
      
      // Clear ripple after animation
      setTimeout(() => setRippleCoords(null), 600);

      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-semibold overflow-hidden',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-95',
          variantStyles[variant],
          sizeStyles[size],
          isFullWidth && 'w-full',
          isSquared && 'rounded-none',
          !isSquared && 'rounded-xl',
          className
        )}
        {...props}
      >
        {/* Ripple Effect */}
        {rippleCoords && (
          <span
            className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
            style={{
              left: rippleCoords.x - 10,
              top: rippleCoords.y - 10,
              width: 20,
              height: 20,
            }}
          />
        )}

        {isLoading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        
        {!isLoading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        
        <span className="relative z-10">{children}</span>
        
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
