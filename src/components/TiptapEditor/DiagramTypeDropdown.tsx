import { Database, Workflow, ChevronDown, Check } from 'lucide-react';
import { Root as SelectRoot, Trigger, Content, Item, ItemText } from '@radix-ui/react-select';

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
  const selectedDiagram = diagramTypes.find((type) => type.id === selectedType) || diagramTypes[0];

  return (
    <SelectRoot value={selectedType} onValueChange={onSelectType}>
      <Trigger
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950 hover:border-slate-400 dark:hover:border-slate-500 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer h-[34px]"
        title="Select diagram type"
        aria-label="Select diagram type"
      >
        {selectedDiagram.icon}
        <span className="text-sm font-medium">{selectedDiagram.name}</span>
        <ChevronDown className="w-3 h-3" />
      </Trigger>
      <Content className="z-50 min-w-[200px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl shadow-lg py-1">
        {diagramTypes.map((type) => (
          <Item
            key={type.id}
            value={type.id}
            className="flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer data-[state=checked]:bg-indigo-50 dark:data-[state=checked]:bg-indigo-950/50 text-slate-700 dark:text-slate-300 data-[state=checked]:text-indigo-700 dark:data-[state=checked]:text-indigo-300"
          >
            <ItemText>{type.name}</ItemText>
            {type.icon}
            <div className="flex-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {type.description}
              </div>
            </div>
            {selectedType === type.id && (
              <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            )}
          </Item>
        ))}
      </Content>
    </SelectRoot>
  );
}
