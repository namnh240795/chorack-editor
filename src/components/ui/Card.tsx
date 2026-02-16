import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  isHoverable?: boolean;
  isClickable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', isHoverable = false, isClickable = false, padding = 'md', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
      elevated: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg',
      outlined: 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700',
      glass: 'glass border border-slate-200/50 dark:border-slate-800/50',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300',
          variantStyles[variant],
          paddingStyles[padding],
          isHoverable && 'hover:shadow-xl hover:-translate-y-1',
          isClickable && 'cursor-pointer hover:shadow-xl hover:-translate-y-1 active:shadow-md active:translate-y-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, noPadding = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5',
        !noPadding && 'p-6 pb-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const CardTitle = forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, size = 'lg', children, ...props }, ref) => {
    const sizeStyles = {
      sm: 'text-lg font-semibold leading-none',
      md: 'text-xl font-semibold leading-none',
      lg: 'text-2xl font-bold leading-none',
      xl: 'text-3xl font-bold leading-none',
    };

    return (
      <h3
        ref={ref}
        className={cn(
          sizeStyles[size],
          'text-slate-900 dark:text-slate-100',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
