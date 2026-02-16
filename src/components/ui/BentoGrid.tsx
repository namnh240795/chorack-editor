import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
  gap?: number;
}

export const BentoGrid = ({ cols = 3, gap = 4, className, children, ...props }: BentoGridProps) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div
      className={cn('grid', gridCols[cols], className)}
      style={{ gap: `${gap * 0.25}rem` }}
      {...props}
    >
      {children}
    </div>
  );
};

interface BentoItemProps extends HTMLAttributes<HTMLDivElement> {
  rowSpan?: 1 | 2;
  colSpan?: 1 | 2;
  variant?: 'default' | 'featured' | 'accent';
  isHoverable?: boolean;
}

export const BentoItem = ({
  rowSpan = 1,
  colSpan = 1,
  variant = 'default',
  isHoverable = true,
  className,
  children,
  ...props
}: BentoItemProps) => {
  const rowSpanClass = rowSpan === 2 ? 'row-span-2' : 'row-span-1';
  const colSpanClass = colSpan === 2 ? 'md:col-span-2' : 'col-span-1';

  const variantStyles = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
    featured: 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0 shadow-lg',
    accent: 'bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        rowSpanClass,
        colSpanClass,
        variantStyles[variant],
        isHoverable && 'hover:shadow-xl hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
