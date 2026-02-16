import { useState, useEffect, useMemo } from 'react';
import { Minus, AlignLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeadingNode {
  id: string;
  level: number;
  text: string;
  children: HeadingNode[];
}

interface EditorOutlineProps {
  content: string;
}

export function EditorOutline({ content }: EditorOutlineProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Parse headings from content
  const headings = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3');

    const nodes: HeadingNode[] = [];
    const stack: HeadingNode[] = [];

    headingElements.forEach((el, index) => {
      const level = parseInt(el.tagName[1]);
      const text = el.textContent || '';
      const id = `heading-${index}`;

      const node: HeadingNode = {
        id,
        level,
        text,
        children: [],
      };

      // Pop stack until we find the parent level
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      // Add to parent or root
      if (stack.length === 0) {
        nodes.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    });

    return nodes;
  }, [content]);

  // Track active heading on scroll
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = document.querySelectorAll('.ProseMirror h1, .ProseMirror h2, .ProseMirror h3');
      let currentId: string | null = null;

      headingElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100) {
          currentId = `heading-${index}`;
        }
      });

      setActiveId(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [content]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const headingElement = document.querySelector(`[data-heading-id="${id}"]`);
    if (headingElement) {
      headingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed right-0 top-1/2 -translate-y-1/2 z-30 transition-all duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-3rem)]'
      )}
    >
      {/* Sidebar */}
      <div className="h-[60vh] w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-l border-slate-200/50 dark:border-slate-700/50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Outline</h3>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <HeadingTree nodes={headings} activeId={activeId} onClick={handleClick} />
        </div>
      </div>

      {/* Toggle button when collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute left-0 top-4 -translate-x-full p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-l-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Show outline"
        >
          <AlignLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
      )}
    </div>
  );
}

interface HeadingTreeProps {
  nodes: HeadingNode[];
  activeId: string | null;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
  depth?: number;
}

function HeadingTree({ nodes, activeId, onClick, depth = 0 }: HeadingTreeProps) {
  if (nodes.length === 0) return null;

  return (
    <ul className={cn('space-y-1', depth > 0 && 'ml-4 mt-1')}>
      {nodes.map((node) => (
        <li key={node.id}>
          <a
            href={`#${node.id}`}
            onClick={(e) => onClick(e, node.id)}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              activeId === node.id
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'text-slate-700 dark:text-slate-300'
            )}
          >
            {node.level > 1 && <Minus className="w-3 h-3 text-gray-400" />}
            <span className="truncate">{node.text || 'Untitled'}</span>
          </a>
          {node.children.length > 0 && (
            <HeadingTree nodes={node.children} activeId={activeId} onClick={onClick} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}
