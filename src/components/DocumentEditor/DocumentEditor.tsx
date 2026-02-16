import { useEffect, useState, useMemo } from 'react';
import { useEditorDB } from '../../hooks/useEditorDB';
import { TiptapEditor } from '../TiptapEditor';
import { setActiveDocumentId } from '../../hooks/useFlowPersistence';
import { Button } from '../ui/Button';
import { EditorOutline } from '../EditorOutline';
import { ArrowLeft, CheckCircle2, Clock, FileText } from 'lucide-react';

interface DocumentEditorProps {
  documentId: number | null;
  onBack: () => void;
}

export function DocumentEditor({ documentId, onBack }: DocumentEditorProps) {
  const { documents, updateDocument } = useEditorDB();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const currentDocument = documents.find((doc) => doc.id === documentId);

  // Calculate word and character count
  const stats = useMemo(() => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    const words = plainText ? plainText.split(/\s+/).length : 0;
    const chars = plainText.length;
    const charsNoSpaces = plainText.replace(/\s/g, '').length;
    return { words, chars, charsNoSpaces };
  }, [content]);

  // Load document data
  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title);
      setContent(currentDocument.content || '');
      setLastSaved(new Date(currentDocument.updatedAt));
    }
  }, [currentDocument]);

  // Set active document ID for flow persistence
  useEffect(() => {
    if (documentId) {
      setActiveDocumentId(documentId);
    }
    return () => {
      setActiveDocumentId(null);
    };
  }, [documentId]);

  // Auto-save with debounce
  useEffect(() => {
    const hasChanges = title !== currentDocument?.title || content !== currentDocument?.content;
    setHasUnsavedChanges(hasChanges);

    const saveTimeout = setTimeout(async () => {
      if (documentId && hasChanges) {
        setIsSaving(true);
        await updateDocument(documentId, { title, content });
        setIsSaving(false);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    }, 500);

    return () => clearTimeout(saveTimeout);
  }, [title, content, documentId, currentDocument, updateDocument]);

  const handleContentUpdate = (newContent: string) => {
    setContent(newContent);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to prevent default and let auto-save handle it
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
      }

      // Escape to go back
      if (e.key === 'Escape' && !hasUnsavedChanges) {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, onBack]);

  if (!documentId || !currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 mb-4">Document not found</p>
          <Button onClick={onBack} variant="secondary" data-testid="error-back-button">
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button & Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex-shrink-0"
                data-testid="back-to-documents-button"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Back</span>
              </Button>

              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="text-xl sm:text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 flex-1 min-w-0"
                placeholder="Untitled document"
              />
            </div>

            {/* Right: Save status & stats */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Save Status */}
              <div className="flex items-center gap-2 text-sm">
                {isSaving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                    <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">Saving...</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <span className="w-4 h-4 rounded-full bg-yellow-400" />
                    <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">Unsaved</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">Saved</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>{stats.words} words</span>
              <span className="hidden sm:inline">{stats.chars} characters</span>
            </div>
            {lastSaved && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <TiptapEditor
          content={content}
          onUpdate={handleContentUpdate}
          editable={true}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Created: {new Date(currentDocument.createdAt).toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Press</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Esc</kbd>
              <span className="hidden sm:inline">to go back</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Outline Sidebar */}
      <EditorOutline content={content} />
    </div>
  );
}
