import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { CommandPalette } from './components/ui/CommandPalette';
import type { Command } from './components/ui/CommandPalette';
import { useCommandPalette as useCommandPaletteHook } from './hooks/useCommandPalette';
import { DocumentManager } from './components/DocumentManager';
import { ToastContainer } from './components/ui/Toast';
import { Moon, Sun } from 'lucide-react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { DocumentCardSkeleton } from './components/ui/Skeleton';

// Lazy load heavy components
const DocumentEditor = lazy(() => import('./components/DocumentEditor/DocumentEditor').then(m => ({ default: m.DocumentEditor })));
const ERDEditorPage = lazy(() => import('./pages/ERDEditorPage').then(m => ({ default: m.ERDEditorPage })));

function AppContent() {
  const [currentDocumentId, setCurrentDocumentId] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const navigate = useNavigate();
  
  // Command palette hook
  const { isOpen: isCommandPaletteOpen, close: closeCommandPalette } = useCommandPaletteHook([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleOpenDocument = (id: number) => {
    setCurrentDocumentId(id);
    navigate(`/documents/${id}`);
  };

  const handleBack = () => {
    setCurrentDocumentId(null);
    navigate('/');
  };

  const handleOpenERDEditor = (diagramId?: string) => {
    if (diagramId) {
      navigate(`/erd-editor/${diagramId}`);
    } else {
      navigate('/erd-editor');
    }
  };

  // Command palette commands
  const commands = useMemo<Command[]>(() => [
    {
      id: 'new-document',
      label: 'New Document',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
      shortcut: '⌘N',
      category: 'Documents',
      action: () => {
        closeCommandPalette();
        navigate('/');
        // Trigger document creation after navigation
        setTimeout(() => {
          const createButton = document.querySelector('[data-create-document]') as HTMLButtonElement;
          createButton?.click();
        }, 100);
      },
    },
    {
      id: 'view-documents',
      label: 'View All Documents',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      shortcut: '⌘D',
      category: 'Documents',
      action: () => {
        closeCommandPalette();
        navigate('/');
      },
    },
    {
      id: 'new-erd',
      label: 'New ERD Diagram',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" /></svg>,
      shortcut: '⌘⇧E',
      category: 'Documents',
      action: () => {
        closeCommandPalette();
        navigate('/erd-editor');
      },
    },
    {
      id: 'toggle-theme',
      label: theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode',
      icon: theme === 'light'
        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      shortcut: '⌘⇧T',
      category: 'Settings',
      action: () => {
        toggleTheme();
        closeCommandPalette();
      },
    },
    {
      id: 'export-data',
      label: 'Export All Data',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      category: 'Settings',
      action: () => {
        closeCommandPalette();
        // Trigger export functionality if available
        const exportButton = document.querySelector('[data-export]') as HTMLButtonElement;
        exportButton?.click();
      },
    },
    {
      id: 'clear-cache',
      label: 'Clear Cache',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
      category: 'Settings',
      action: () => {
        closeCommandPalette();
        if (window.confirm('Clear all local data? This cannot be undone.')) {
          localStorage.clear();
          window.location.reload();
        }
      },
    },
    {
      id: 'go-home',
      label: 'Go to Dashboard',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      shortcut: '⌘G',
      category: 'Navigation',
      action: () => {
        closeCommandPalette();
        navigate('/');
      },
    },
    {
      id: 'shortcuts',
      label: 'Keyboard Shortcuts',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      category: 'Help',
      action: () => {
        closeCommandPalette();
        alert('Keyboard Shortcuts:\n\nCmd+K - Open Command Palette\nCmd+N - New Document\nCmd+D - View Documents\nCmd+G - Go to Dashboard\nCmd+Shift+E - New ERD Diagram\nCmd+Shift+T - Toggle Theme');
      },
    },
  ], [theme, navigate, closeCommandPalette]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Beautiful gradient background mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 dark:bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      {/* Keyboard Shortcut Hint - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:block">
        <div className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg shadow-md border border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium">⌘</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium">K</kbd>
          <span className="ml-1">to open menu</span>
        </div>
      </div>

      {/* Theme Toggle - Floating pill */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 group"
        aria-label="Toggle theme"
      >
        <div className="relative flex items-center gap-3 px-4 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full shadow-lg border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-xl hover:scale-105">
          {theme === 'light' ? (
            <>
              <Moon className="w-5 h-5 text-slate-700 transition-transform group-hover:rotate-12" />
              <span className="text-sm font-medium text-slate-700 pr-1">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-5 h-5 text-yellow-500 transition-transform group-hover:rotate-90" />
              <span className="text-sm font-medium text-slate-300 pr-1">Light</span>
            </>
          )}
        </div>
      </button>

      {/* Main Content */}
      <div className="relative z-10">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <DocumentCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={
              <DocumentManager
                onOpenDocument={handleOpenDocument}
                onOpenERDEditor={handleOpenERDEditor}
              />
            } />
            <Route path="/documents/:id" element={
              <DocumentEditor
                documentId={currentDocumentId}
                onBack={handleBack}
              />
            } />
            <Route path="/erd-editor" element={<ERDEditorPage />} />
            <Route path="/erd-editor/:diagramId" element={<ERDEditorPage />} />
          </Routes>
        </Suspense>
      </div>

      <ToastContainer />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        commands={commands}
        placeholder="Type a command or search..."
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
