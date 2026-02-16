import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  type?: 'fade' | 'slide' | 'scale';
}

export const PageTransition = ({ children, className, type = 'fade' }: PageTransitionProps) => {
  const typeStyles = {
    fade: 'animate-fade-in',
    slide: 'animate-slide-in-bottom',
    scale: 'animate-scale-in',
  };

  return (
    <div className={cn(typeStyles[type], className)}>
      {children}
    </div>
  );
};
