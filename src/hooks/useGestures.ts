import type { RefObject } from 'react';
import { useRef, useEffect } from 'react';

interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export const useGestures = (
  callbacks: SwipeCallbacks,
  threshold: number = 50
): SwipeHandlers => {
  const touchStartRef = useRef<{ x: number; y: number; distance: number } | null>(null);
  const initialDistanceRef = useRef<number>(0);

  const getDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        distance: 0,
      };
    } else if (e.touches.length === 2) {
      initialDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length > 0) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if it's a horizontal or vertical swipe
    if (Math.max(absDeltaX, absDeltaY) > threshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          callbacks.onSwipeRight?.();
        } else {
          callbacks.onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          callbacks.onSwipeDown?.();
        } else {
          callbacks.onSwipeUp?.();
        }
      }
    }

    touchStartRef.current = null;
  };

  // Handle pinch gesture
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && callbacks.onPinch) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistanceRef.current;
        callbacks.onPinch(scale);
      }
    };

    if (callbacks.onPinch) {
      document.addEventListener('touchmove', handleTouchMove);
      return () => document.removeEventListener('touchmove', handleTouchMove);
    }
  }, [callbacks]);

  return {
    onTouchStart,
    onTouchEnd,
  };
};

// Hook for pinch-to-zoom on specific element
export const usePinchZoom = (_ref: RefObject<HTMLElement>, _onScaleChange?: (scale: number) => void) => {
  // Implementation placeholder - can be completed as needed
  return 1;
};
