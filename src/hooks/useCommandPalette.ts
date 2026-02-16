import { useState } from 'react';

export interface Command {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  category?: string;
  action: () => void;
}

export const useCommandPalette = (commands: Command[]) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter(
    (command) =>
      command.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const open = () => {
    setIsOpen(true);
    setSearchQuery('');
    setSelectedIndex(0);
  };

  const close = () => {
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  const executeCommand = (command: Command) => {
    command.action();
    close();
  };

  return {
    isOpen,
    searchQuery,
    setSearchQuery,
    selectedIndex,
    setSelectedIndex,
    filteredCommands,
    open,
    close,
    toggle,
    executeCommand,
  };
};
