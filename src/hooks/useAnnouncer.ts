import { useEffect, useRef } from 'react';

type AnnouncementType = 'polite' | 'assertive';

export const useAnnouncer = () => {
  const announceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create announcer element if it doesn't exist
    if (!announceRef.current) {
      const element = document.createElement('div');
      element.setAttribute('role', 'status');
      element.setAttribute('aria-live', 'polite');
      element.setAttribute('aria-atomic', 'true');
      element.className = 'sr-only';
      element.style.position = 'absolute';
      element.style.left = '-10000px';
      element.style.width = '1px';
      element.style.height = '1px';
      element.style.overflow = 'hidden';
      document.body.appendChild(element);
      announceRef.current = element;
    }

    return () => {
      if (announceRef.current && announceRef.current.parentNode) {
        announceRef.current.parentNode.removeChild(announceRef.current);
      }
    };
  }, []);

  const announce = (message: string, type: AnnouncementType = 'polite') => {
    if (!announceRef.current) return;

    announceRef.current.setAttribute('aria-live', type);
    announceRef.current.textContent = '';

    // Use setTimeout to ensure screen readers pick up the change
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = message;
      }
    }, 100);
  };

  return { announce };
};
