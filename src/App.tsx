import { useState, useEffect, lazy, Suspense } from 'react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Beautiful gradient background mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 dark:bg-pink-500/5 rounded-full blur-3xl" />
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
