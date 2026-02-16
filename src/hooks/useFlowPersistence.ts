import { useEffect, useState, useCallback, useRef } from 'react';
import {
  addEdge,
  type Connection,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import { useEditorDB } from './useEditorDB';

interface UseFlowPersistenceResult {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
}

// Global registry for active document IDs
let activeDocumentId: number | null = null;
const documentIdListeners = new Set<(id: number | null) => void>();

export function setActiveDocumentId(id: number | null) {
  activeDocumentId = id;
  documentIdListeners.forEach(listener => listener(id));
}

export function useActiveDocumentId() {
  const [documentId, setDocumentId] = useState<number | null>(activeDocumentId);

  useEffect(() => {
    const listener = (id: number | null) => {
      setDocumentId(id);
    };

    documentIdListeners.add(listener);
    return () => {
      documentIdListeners.delete(listener);
    };
  }, []);

  return documentId;
}

export function useFlowPersistence(
  flowId: string
): UseFlowPersistenceResult {
  const { loadFlowData, saveFlowData } = useEditorDB();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const documentId = useActiveDocumentId();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load flow data on mount
  useEffect(() => {
    const loadFlow = async () => {
      const data = await loadFlowData(flowId);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      setIsLoaded(true);
    };

    if (flowId && !isLoaded) {
      loadFlow();
    }
  }, [flowId, loadFlowData, setNodes, setEdges, isLoaded]);

  // Auto-save flow data with debounce
  useEffect(() => {
    if (!isLoaded) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (documentId && (nodes.length > 0 || edges.length > 0)) {
        await saveFlowData(flowId, nodes, edges, documentId);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, flowId, documentId, saveFlowData, isLoaded]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  };
}
