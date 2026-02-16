import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular', width, height, animation = 'pulse', ...props }, ref) => {
    const variantStyles = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-lg',
    };

    const animationStyles = {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-slate-200 dark:bg-slate-700',
          variantStyles[variant],
          animationStyles[animation],
          className
        )}
        style={{ width, height }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Skeleton Components for Common Patterns

interface TextSkeletonProps {
  lines?: number;
  className?: string;
}

export const TextSkeleton = ({ lines = 3, className }: TextSkeletonProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height="1rem"
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
};

interface AvatarSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarSkeleton = ({ size = 'md', className }: AvatarSkeletonProps) => {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeStyles[size], className)}
    />
  );
};

interface CardSkeletonProps {
  showAvatar?: boolean;
  lines?: number;
  className?: string;
}

export const CardSkeleton = ({ showAvatar = false, lines = 3, className }: CardSkeletonProps) => {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <AvatarSkeleton />
          <Skeleton variant="text" width="60%" height="1.25rem" />
        </div>
      )}
      <Skeleton variant="text" width="100%" height="1.5rem" />
      <TextSkeleton lines={lines} />
    </div>
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton = ({ rows = 5, columns = 4, className }: TableSkeletonProps) => {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex space-x-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} variant="text" width={i === 0 ? '30%' : '15%'} height="1.25rem" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              width={colIndex === 0 ? '30%' : '15%'}
              height="1rem"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface DocumentCardSkeletonProps {
  className?: string;
}

export const DocumentCardSkeleton = ({ className }: DocumentCardSkeletonProps) => {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      {/* Title */}
      <Skeleton variant="rounded" width="60%" height="1.5rem" />
      
      {/* Description */}
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" height="1rem" />
        <Skeleton variant="text" width="90%" height="1rem" />
        <Skeleton variant="text" width="70%" height="1rem" />
      </div>
      
      {/* Metadata */}
      <div className="flex items-center space-x-4 pt-2">
        <Skeleton variant="circular" width="2rem" height="2rem" />
        <Skeleton variant="text" width="40%" height="1rem" />
      </div>
      
      {/* Actions */}
      <div className="flex space-x-2 pt-4">
        <Skeleton variant="rounded" width="25%" height="2.5rem" />
        <Skeleton variant="rounded" width="25%" height="2.5rem" />
      </div>
    </div>
  );
};
