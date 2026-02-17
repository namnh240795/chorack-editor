import { useState, useEffect } from 'react';
import { ERDEditor } from '../components/ERDEditor/ERDEditor';
import { useERDDiagrams } from '../hooks/useERDDiagrams';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export function ERDEditorPage() {
  const navigate = useNavigate();
  const { diagramId } = useParams<{ diagramId?: string }>();
  const { loadDiagram, updateDiagram, createDiagram } = useERDDiagrams();
  const [initialNodes, setInitialNodes] = useState<any[]>([]);
  const [initialEdges, setInitialEdges] = useState<any[]>([]);
  const [diagramName, setDiagramName] = useState<string>('Untitled ERD Diagram');
  const [loaded, setLoaded] = useState(false);

  // Load diagram if diagramId is provided
  useEffect(() => {
    if (diagramId && !loaded) {
      loadDiagram(Number(diagramId)).then((data) => {
        if (data) {
          setInitialNodes(data.nodes || []);
          setInitialEdges(data.edges || []);
          setDiagramName(data.name || 'Untitled ERD Diagram');
        }
        setLoaded(true);
      });
    } else if (!diagramId) {
      setLoaded(true);
    }
  }, [diagramId, loaded, loadDiagram]);

  const handleSave = async (
    { nodes, edges }: { nodes: any[]; edges: any[] },
    isAutoSave = false
  ) => {
    if (diagramId) {
      // Update existing diagram
      await updateDiagram(Number(diagramId), {
        nodes,
        edges,
        name: diagramName,
      });
      // Only show alert for manual saves
      if (!isAutoSave) {
        alert(`Diagram "${diagramName}" saved successfully!`);
      }
    } else {
      // Create new diagram
      const id = await createDiagram('Untitled ERD Diagram', 'Database schema', nodes, edges);
      // Only show alert for manual saves
      if (!isAutoSave) {
        alert(`New diagram created with ID: ${id}`);
      }
      // Navigate to the new diagram
      navigate(`/erd-editor/${id}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Documents</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {diagramId ? `Editing: ${diagramName}` : 'New ERD Diagram'}
            </span>
          </div>
        </div>
      </div>

      {/* Editor */}
      {loaded && (
        <div className="flex-1 overflow-hidden">
          <ERDEditor
            onSave={handleSave}
            initialNodes={initialNodes}
            initialEdges={initialEdges}
          />
        </div>
      )}
    </div>
  );
}
