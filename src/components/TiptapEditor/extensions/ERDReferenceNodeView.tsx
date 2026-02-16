import { NodeViewWrapper } from '@tiptap/react';
import { useCallback, useState, useEffect } from 'react';
import { ExternalLink, Edit, Trash2 } from 'lucide-react';
import { useEditorDB } from '../../../hooks/useEditorDB';

interface ERDReferenceNodeViewProps {
  node: {
    attrs: {
      diagramId: string;
      caption?: string;
    };
  };
  updateAttributes: (attributes: Record<string, any>) => void;
  deleteNode: () => void;
}

export function ERDReferenceNodeView(props: ERDReferenceNodeViewProps) {
  const { diagramId, caption } = props.node.attrs;
  const [diagram, setDiagram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { loadDiagram } = useEditorDB();

  useEffect(() => {
    const loadDiagramData = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await loadDiagram(diagramId);
        if (data) {
          setDiagram(data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
        console.error('Failed to load ERD diagram:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDiagramData();
  }, [diagramId, loadDiagram]);

  const handleOpenInEditor = useCallback(() => {
    // Open the ERD editor with this diagram
    window.location.href = `/erd-editor/${diagramId}`;
  }, [diagramId]);

  const handleEditCaption = useCallback(() => {
    const newCaption = prompt('Enter caption:', caption || '');
    if (newCaption !== null) {
      props.updateAttributes({ caption: newCaption || null });
    }
  }, [caption, props.updateAttributes]);

  if (loading) {
    return (
      <NodeViewWrapper
        className="inline-block mx-1 my-1"
        as="span"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600">
          <span className="animate-pulse">Loading ERD...</span>
        </span>
      </NodeViewWrapper>
    );
  }

  if (error || !diagram) {
    return (
      <NodeViewWrapper
        className="inline-block mx-1 my-1"
        as="span"
      >
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          onClick={props.deleteNode}
          title="Click to remove broken reference"
        >
          <Trash2 className="w-4 h-4" />
          <span>Broken ERD reference: {diagramId}</span>
        </span>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      className="inline-block mx-1 my-1 group"
      as="span"
    >
      <span
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
        onClick={handleOpenInEditor}
        title="Click to open in ERD editor"
      >
        <ExternalLink className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">{diagram.name}</span>
        {caption && (
          <span className="text-blue-600 dark:text-blue-300">({caption})</span>
        )}
        <span className="text-xs text-blue-500 dark:text-blue-400">
          {diagram.nodes.length} entities, {diagram.edges.length} relationships
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditCaption();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-all"
          title="Edit caption"
        >
          <Edit className="w-3 h-3" />
        </button>
      </span>
    </NodeViewWrapper>
  );
}
