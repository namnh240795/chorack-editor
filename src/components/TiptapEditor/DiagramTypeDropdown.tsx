import { useState, useRef, useEffect } from 'react';
import { Database, Workflow } from 'lucide-react';

export interface DiagramType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export const diagramTypes: DiagramType[] = [
  {
    id: 'erd',
    name: 'ERD',
    description: 'Entity Relationship Diagram',
    icon: <Database className="w-4 h-4" />,
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    description: 'Process Flow Diagram',
    icon: <Workflow className="w-4 h-4" />,
  },
];

interface DiagramTypeDropdownProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

export function DiagramTypeDropdown({ selectedType, onSelectType }: DiagramTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedDiagram = diagramTypes.find((type) => type.id === selectedType) || diagramTypes[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-300"
        title="Select diagram type"
        aria-label="Select diagram type"
        aria-expanded={isOpen}
      >
        {selectedDiagram.icon}
        <span className="text-sm font-medium">{selectedDiagram.name}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 min-w-[200px] z-50">
          {diagramTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                onSelectType(type.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                selectedType === type.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {type.icon}
              <div className="flex-1">
                <div className="font-medium text-sm">{type.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {type.description}
                </div>
              </div>
              {selectedType === type.id && (
                <svg
                  className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
