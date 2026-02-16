import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface Command {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  category?: string;
  action: () => void;
}

interface CommandPaletteProps {
  commands: Command[];
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
}

export const CommandPalette = ({ commands, isOpen, onClose, placeholder = 'Type a command or search...' }: CommandPaletteProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter commands based on search query
  const filteredCommands = commands.filter(
    (command) =>
      command.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group commands by category
  const categories = Array.from(new Set(filteredCommands.map((cmd) => cmd.category || 'Other')));

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
            setSearchQuery('');
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          setSearchQuery('');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && filteredCommands[selectedIndex]) {
      const items = listRef.current.querySelectorAll('li[role="option"]');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, filteredCommands.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="relative flex items-start justify-center pt-[15vh]">
        <div className="relative w-full max-w-xl mx-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
            {/* Search Input */}
            <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-700">
              <svg
                className="w-5 h-5 text-slate-400 dark:text-slate-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 py-4 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 rounded">
                ESC
              </kbd>
            </div>

            {/* Commands List */}
            {filteredCommands.length > 0 ? (
              <ul
                ref={listRef}
                className="max-h-80 overflow-y-auto py-2"
                role="listbox"
              >
                {categories.map((category) => {
                  const categoryCommands = filteredCommands.filter(
                    (cmd) => (cmd.category || 'Other') === category
                  );

                  if (categoryCommands.length === 0) return null;

                  return (
                    <li key={category} className="px-2">
                      {/* Category Header */}
                      {category !== 'Other' && (
                        <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {category}
                        </div>
                      )}

                      {/* Commands */}
                      {categoryCommands.map((command) => {
                        const globalIndex = filteredCommands.indexOf(command);
                        return (
                          <button
                            key={command.id}
                            role="option"
                            aria-selected={selectedIndex === globalIndex}
                            onClick={() => {
                              command.action();
                              onClose();
                              setSearchQuery('');
                            }}
                            className={cn(
                              'w-full flex items-center px-3 py-2.5 rounded-lg transition-colors duration-150',
                              'text-left',
                              selectedIndex === globalIndex
                                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-100'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            )}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                          >
                            {command.icon && (
                              <span className="flex-shrink-0 w-5 h-5 mr-3">
                                {command.icon}
                              </span>
                            )}
                            <span className="flex-1 font-medium">{command.label}</span>
                            {command.shortcut && (
                              <kbd className="px-2 py-1 text-xs font-semibold text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 rounded">
                                {command.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-12 text-center text-slate-400 dark:text-slate-600">
                <svg
                  className="w-12 h-12 mx-auto mb-4 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm">No commands found</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded mr-1">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center">
                  <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded mr-1">↵</kbd>
                  select
                </span>
              </div>
              <span>{filteredCommands.length} commands</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing command palette
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
};
