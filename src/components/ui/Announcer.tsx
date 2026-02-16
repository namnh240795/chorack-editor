import { useEffect, useRef } from 'react';

interface AnnouncerProps {
  message?: string;
  type?: 'polite' | 'assertive';
}

export const Announcer = ({ message, type = 'polite' }: AnnouncerProps) => {
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && announcerRef.current) {
      announcerRef.current.textContent = message;
      
      // Clear after announcement
      const timeout = setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [message]);

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live={type}
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    />
  );
};

// Screen reader only utility
export const ScreenReaderOnly = ({ children }: { children: React.ReactNode }) => {
  return (
    <span
      className="sr-only"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {children}
    </span>
  );
};
