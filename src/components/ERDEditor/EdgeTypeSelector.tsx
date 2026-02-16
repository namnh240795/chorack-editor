import { Link2 } from 'lucide-react';
import { Card } from '../ui/Card';

export type EdgeType = '1:1' | '1:N' | 'N:1' | 'N:M';

interface EdgeTypeOption {
  type: EdgeType;
  label: string;
  description: string;
  icon: string;
}

const EDGE_TYPES: EdgeTypeOption[] = [
  {
    type: '1:1',
    label: 'One to One',
    description: 'Each entity in the set relates to one entity in the other set',
    icon: '1️⃣',
  },
  {
    type: '1:N',
    label: 'One to Many',
    description: 'One entity relates to many entities in the other set',
    icon: '📊',
  },
  {
    type: 'N:1',
    label: 'Many to One',
    description: 'Many entities relate to one entity in the other set',
    icon: '📈',
  },
  {
    type: 'N:M',
    label: 'Many to Many',
    description: 'Many entities relate to many entities in the other set',
    icon: '🔗',
  },
];

interface EdgeTypeSelectorProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onSelect: (type: EdgeType) => void;
  onClose: () => void;
}

export function EdgeTypeSelector({ isOpen, position, onSelect, onClose }: EdgeTypeSelectorProps) {
  if (!isOpen) return null;

  const handleSelect = (type: EdgeType) => {
    onSelect(type);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Popup Menu */}
      <div
        className="fixed z-50 w-80 animate-scale-in"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%) translateY(-10px)',
        }}
      >
        <Card variant="elevated" isHoverable={false} padding="none">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-t-2xl">
            <div className="flex items-center gap-2 text-white">
              <Link2 className="w-5 h-5" />
              <span className="font-semibold">Select Relationship Type</span>
            </div>
          </div>

          {/* Options */}
          <div className="p-2">
            {EDGE_TYPES.map((edgeType, index) => (
              <button
                key={edgeType.type}
                onClick={() => handleSelect(edgeType.type)}
                className="w-full px-4 py-3 mb-1 last:mb-0 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all duration-200 text-left group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{edgeType.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {edgeType.label}
                      </span>
                      <span className="text-xs font-mono px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                        {edgeType.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {edgeType.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-2xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Esc</kbd> to cancel
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
