import { useState, useMemo, useEffect } from 'react';
import { useEditorDB } from '../hooks/useEditorDB';
import { useERDDiagrams } from '../hooks/useERDDiagrams';
import type { EditorDocument, ERDDiagram } from '../db/types';
import { Button } from './ui/Button';
import { ConfirmModal } from './ui/Modal';
import { useToast } from './ui/Toast';
import { DocumentCardSkeleton } from './ui/Skeleton';
import { cn } from '@/lib/utils';
import { getRelativeTime } from '@/lib/utils';
import {
  FileText,
  Grid3x3,
  List,
  Search,
  Plus,
  Upload,
  Download,
  Trash2,
  FolderOpen,
  Clock,
  Database,
  ChevronDown,
} from 'lucide-react';
import { Root as SelectRoot, Trigger, Value, Content, Item, ItemText } from '@radix-ui/react-select';

type ViewMode = 'grid' | 'list';
type SortBy = 'title' | 'createdAt' | 'updatedAt';

interface DocumentManagerProps {
  onOpenDocument: (id: number) => void;
  onOpenERDEditor?: (diagramId?: string) => void;
}

export function DocumentManager({ onOpenDocument, onOpenERDEditor }: DocumentManagerProps) {
  const {
    documents,
    createDocument,
    deleteDocument,
    exportDocument,
    importDocument,
  } = useEditorDB();
  const {
    diagrams,
    createDiagram: createERDDiagram,
    deleteDiagram: deleteERDDiagram,
    exportDiagram: exportERDDiagram,
    importDiagram: importERDDiagram,
    loadDiagram,
  } = useERDDiagrams();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [deleteModal, setDeleteModal] = useState<{ id: number; title: string; type: 'document' | 'erd' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
    });

    return filtered;
  }, [documents, searchQuery, sortBy]);

  // Filter and sort ERD diagrams
  const filteredDiagrams = useMemo(() => {
    let filtered = diagrams.filter((diagram) =>
      diagram.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
    });

    return filtered;
  }, [diagrams, searchQuery, sortBy]);

  const handleCreate = async () => {
    try {
      const id = await createDocument('My New Document');
      success('Document created successfully');
      // Navigate to the newly created document
      onOpenDocument(id);
    } catch {
      error('Failed to create document');
    }
  };

  const handleExport = async (id: number, title: string) => {
    try {
      const json = await exportDocument(id);
      if (json) {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        success('Document exported successfully');
      }
    } catch {
      error('Failed to export document');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const json = event.target?.result as string;
          await importDocument(json);
          success('Document imported successfully');
        };
        reader.readAsText(file);
      } catch {
        error('Failed to import document');
      }
    }
    e.target.value = '';
  };

  const handleCreateERD = async () => {
    try {
      const id = await createERDDiagram('My ERD Diagram', 'Database schema');
      success('ERD diagram created successfully');
      // Open the ERD editor with the new diagram
      onOpenERDEditor && onOpenERDEditor(String(id));
    } catch {
      error('Failed to create ERD diagram');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;

    try {
      if (deleteModal.type === 'document') {
        await deleteDocument(deleteModal.id);
        success('Document deleted successfully');
      } else {
        await deleteERDDiagram(deleteModal.id);
        success('ERD diagram deleted successfully');
      }
    } catch {
      error('Failed to delete');
    } finally {
      setDeleteModal(null);
    }
  };

  const handleExportERD = async (id: number, name: string) => {
    try {
      const json = await exportERDDiagram(id);
      if (json) {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/[^a-z0-9]/gi, '_')}_erd.json`;
        a.click();
        URL.revokeObjectURL(url);
        success('ERD diagram exported successfully');
      }
    } catch {
      error('Failed to export ERD diagram');
    }
  };

  const handleImportERD = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const json = event.target?.result as string;
          await importERDDiagram(json);
          success('ERD diagram imported successfully');
        };
        reader.readAsText(file);
      } catch {
        error('Failed to import ERD diagram');
      }
    }
    e.target.value = '';
  };

  const handleOpenERD = async (id: number) => {
    try {
      const diagram = await loadDiagram(id);
      if (diagram) {
        onOpenERDEditor && onOpenERDEditor(String(id));
      }
    } catch {
      error('Failed to open ERD diagram');
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Beautiful Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-primary">
                My Workspace
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {documents.length} {documents.length === 1 ? 'document' : 'documents'}
                {diagrams.length > 0 && ` • ${diagrams.length} ${diagrams.length === 1 ? 'ERD diagram' : 'ERD diagrams'}`} stored locally
              </p>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort */}
            <SelectRoot value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <Trigger className="flex items-center justify-between px-4 py-2 pr-10 text-base rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-900 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 focus:border-indigo-500 hover:border-slate-400 dark:hover:border-slate-500 appearance-none cursor-pointer transition-all duration-200 hover:bg-white dark:hover:bg-slate-800 min-w-[180px] h-[42px]">
                <Value />
                <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
              </Trigger>
              <Content className="z-50 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl shadow-lg">
                <Item value="updatedAt" className="px-4 py-3 text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50">
                  <ItemText>Last Modified</ItemText>
                </Item>
                <Item value="createdAt" className="px-4 py-3 text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50">
                  <ItemText>Date Created</ItemText>
                </Item>
                <Item value="title" className="px-4 py-3 text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50">
                  <ItemText>Name (A-Z)</ItemText>
                </Item>
              </Content>
            </SelectRoot>

            {/* View Toggle */}
            <div className="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2.5 rounded-lg transition-all duration-200',
                  viewMode === 'grid'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
                aria-label="Grid view"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2.5 rounded-lg transition-all duration-200',
                  viewMode === 'list'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Import Document */}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button
                variant="secondary"
                size="md"
                className="cursor-pointer shadow-sm hover:shadow transition-all duration-200"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import Doc</span>
              </Button>
            </label>

            {/* Import ERD */}
            <input
              type="file"
              accept=".json"
              onChange={handleImportERD}
              className="hidden"
              id="import-erd"
            />
            <label htmlFor="import-erd">
              <Button
                variant="secondary"
                size="md"
                className="cursor-pointer shadow-sm hover:shadow transition-all duration-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 hover:from-purple-600 hover:to-indigo-700"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import ERD</span>
              </Button>
            </label>

            {/* ERD Editor Button */}
            <Button
              onClick={handleCreateERD}
              size="md"
              variant="secondary"
              className="shadow-sm hover:shadow transition-all duration-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 hover:from-purple-600 hover:to-indigo-700"
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">New ERD</span>
            </Button>

            {/* New Document */}
            <Button
              onClick={handleCreate}
              size="md"
              className="shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
              data-testid="new-document-button"
              data-create-document="true"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Document</span>
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {documents.length === 0 && diagrams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in">
            <div className="w-24 h-24 mb-8 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/50 dark:to-violet-950/50 flex items-center justify-center shadow-inner">
              <FileText className="w-12 h-12 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              No documents or diagrams yet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
              Create your first document or ERD diagram to get started
            </p>
            <div className="flex gap-4">
              <Button
                onClick={handleCreate}
                size="lg"
                className="shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
                data-create-document="true"
              >
                <Plus className="w-5 h-5" />
                New Document
              </Button>
              <Button
                onClick={handleCreateERD}
                size="lg"
                variant="secondary"
                className="shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0"
              >
                <Database className="w-5 h-5" />
                New ERD Diagram
              </Button>
            </div>
          </div>
        )}

        {/* No Search Results */}
        {documents.length > 0 && filteredDocuments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in">
            <div className="w-20 h-20 mb-6 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No documents found
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search query
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div
            className={cn(
              'grid gap-4',
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Documents Grid/List */}
        {!isLoading && filteredDocuments.length > 0 && (
          <>
            {filteredDocuments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Documents
                </h2>
                <div
                  className={cn(
                    'grid gap-4 animate-fade-in stagger-children',
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1'
                  )}
                >
                  {filteredDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      viewMode={viewMode}
                      onOpen={() => doc.id && onOpenDocument(doc.id)}
                      onExport={() => doc.id && handleExport(doc.id, doc.title)}
                      onDelete={() => setDeleteModal({ id: doc.id!, title: doc.title, type: 'document' })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ERD Diagrams Grid/List */}
            {filteredDiagrams.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-500" />
                  ERD Diagrams
                </h2>
                <div
                  className={cn(
                    'grid gap-4 animate-fade-in stagger-children',
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1'
                  )}
                >
                  {filteredDiagrams.map((diagram) => (
                    <ERDDiagramCard
                      key={diagram.id}
                      diagram={diagram}
                      viewMode={viewMode}
                      onOpen={() => diagram.id && handleOpenERD(diagram.id)}
                      onExport={() => diagram.id && handleExportERD(diagram.id, diagram.name)}
                      onDelete={() => setDeleteModal({ id: diagram.id!, title: diagram.name, type: 'erd' })}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal !== null}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDeleteConfirm}
        title={deleteModal?.type === 'erd' ? 'Delete ERD Diagram' : 'Delete Document'}
        message={`Are you sure you want to delete "${deleteModal?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

interface DocumentCardProps {
  document: EditorDocument;
  viewMode: ViewMode;
  onOpen: () => void;
  onExport: () => void;
  onDelete: () => void;
}

function DocumentCard({ document, viewMode, onOpen, onExport, onDelete }: DocumentCardProps) {
  const isList = viewMode === 'list';

  return (
    <div
      className={cn(
        'group bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border',
        'hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-800',
        'transition-all duration-300 card-hover',
        'border-slate-200/50 dark:border-slate-700/50',
        isList ? 'p-5 flex items-center gap-5' : 'p-6 flex flex-col'
      )}
    >
      {/* Icon & Title */}
      <div className={cn('flex items-start gap-4', isList ? 'flex-1 min-w-0' : 'mb-4')}>
        <div className={cn(
          'flex-shrink-0 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/50 flex items-center justify-center shadow-inner',
          isList ? 'w-14 h-14' : 'w-16 h-16'
        )}>
          <FileText className={cn(
            'text-indigo-600 dark:text-indigo-400',
            isList ? 'w-7 h-7' : 'w-8 h-8'
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-lg mb-2">
            {document.title || 'Untitled Document'}
          </h3>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className={cn(
              'flex items-center gap-1.5',
              'px-2.5 py-1 rounded-full',
              'bg-slate-100 dark:bg-slate-800',
              'font-medium'
            )}>
              <Clock className="w-3.5 h-3.5" />
              {getRelativeTime(document.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={cn(
        'flex gap-2',
        isList ? '' : 'mt-auto pt-4 border-t border-slate-100 dark:border-slate-800'
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpen}
          className="flex-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200"
        >
          <FolderOpen className="w-4 h-4" />
          <span className={isList ? 'hidden sm:inline' : ''}>Open</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="hidden sm:flex hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

interface ERDDiagramCardProps {
  diagram: ERDDiagram;
  viewMode: ViewMode;
  onOpen: () => void;
  onExport: () => void;
  onDelete: () => void;
}

function ERDDiagramCard({ diagram, viewMode, onOpen, onExport, onDelete }: ERDDiagramCardProps) {
  const isList = viewMode === 'list';

  return (
    <div
      className={cn(
        'group bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border',
        'hover:shadow-xl hover:-translate-y-1 hover:border-purple-200 dark:hover:border-purple-800',
        'transition-all duration-300 card-hover',
        'border-slate-200/50 dark:border-slate-700/50',
        isList ? 'p-5 flex items-center gap-5' : 'p-6 flex flex-col'
      )}
    >
      {/* Icon & Title */}
      <div className={cn('flex items-start gap-4', isList ? 'flex-1 min-w-0' : 'mb-4')}>
        <div className={cn(
          'flex-shrink-0 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 flex items-center justify-center shadow-inner',
          isList ? 'w-14 h-14' : 'w-16 h-16'
        )}>
          <Database className={cn(
            'text-purple-600 dark:text-purple-400',
            isList ? 'w-7 h-7' : 'w-8 h-8'
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-lg">
              {diagram.name || 'Untitled ERD Diagram'}
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex-shrink-0">
              ERD
            </span>
          </div>
          {diagram.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
              {diagram.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className={cn(
              'flex items-center gap-1.5',
              'px-2.5 py-1 rounded-full',
              'bg-slate-100 dark:bg-slate-800',
              'font-medium'
            )}>
              <Clock className="w-3.5 h-3.5" />
              {getRelativeTime(diagram.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={cn(
        'flex gap-2',
        isList ? '' : 'mt-auto pt-4 border-t border-slate-100 dark:border-slate-800'
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpen}
          className="flex-1 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200"
        >
          <FolderOpen className="w-4 h-4" />
          <span className={isList ? 'hidden sm:inline' : ''}>Open</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="hidden sm:flex hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
