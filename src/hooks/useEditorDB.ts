import { db } from '../db/database';
import type { EditorDocument } from '../db/types';
import { useLiveQuery } from 'dexie-react-hooks';

export function useEditorDB() {

  // Get all documents (live query)
  const documents = useLiveQuery(() => db.documents.orderBy('updatedAt').reverse().toArray());

  // Get a single document with its nodes and edges
  const loadDocument = async (id: number) => {
    const document = await db.documents.get(id);
    if (!document) return null;

    const nodes = await db.nodes.where('documentId').equals(id).toArray();
    const edges = await db.edges.where('documentId').equals(id).toArray();

    return {
      ...document,
      nodes,
      edges,
    };
  };

  // Create a new document
  const createDocument = async (title: string = 'Untitled Document') => {
    const now = new Date();
    const id = await db.documents.add({
      title,
      content: '',
      createdAt: now,
      updatedAt: now,
    });
    return id;
  };

  // Update document
  const updateDocument = async (id: number, updates: Partial<EditorDocument>) => {
    await db.documents.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  // Delete document
  const deleteDocument = async (id: number) => {
    await db.documents.delete(id);
    await db.nodes.where('documentId').equals(id).delete();
    await db.edges.where('documentId').equals(id).delete();
  };

  // Save nodes for a document
  const saveNodes = async (documentId: number, nodes: any[]) => {
    await db.transaction('rw', db.nodes, async () => {
      await db.nodes.where('documentId').equals(documentId).delete();
      const nodesToSave = nodes.map((node) => ({
        documentId,
        nodeId: node.id,
        type: node.type,
        data: node.data,
        position: node.position,
      }));
      await db.nodes.bulkAdd(nodesToSave);
    });
  };

  // Save edges for a document
  const saveEdges = async (documentId: number, edges: any[]) => {
    await db.transaction('rw', db.edges, async () => {
      await db.edges.where('documentId').equals(documentId).delete();
      const edgesToSave = edges.map((edge) => ({
        documentId,
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        data: edge.data,
      }));
      await db.edges.bulkAdd(edgesToSave);
    });
  };

  // Export document to JSON
  const exportDocument = async (id: number) => {
    const document = await db.documents.get(id);
    if (!document) return null;

    const nodes = await db.nodes.where('documentId').equals(id).toArray();
    const edges = await db.edges.where('documentId').equals(id).toArray();

    return JSON.stringify(
      {
        document,
        nodes,
        edges,
      },
      null,
      2
    );
  };

  // Import document from JSON
  const importDocument = async (json: string) => {
    const data = JSON.parse(json);
    const { document, nodes, edges } = data;

    const docId = await db.documents.add({
      title: document.title,
      content: document.content,
      createdAt: new Date(document.createdAt),
      updatedAt: new Date(),
    });

    if (nodes) {
      await db.nodes.bulkAdd(
        nodes.map((node: any) => ({
          documentId: docId,
          ...node,
        }))
      );
    }

    if (edges) {
      await db.edges.bulkAdd(
        edges.map((edge: any) => ({
          documentId: docId,
          ...edge,
        }))
      );
    }

    return docId;
  };

  // Load flow data by flowId
  const loadFlowData = async (flowId: string) => {
    const nodes = await db.nodes.where('flowId').equals(flowId).toArray();
    const edges = await db.edges.where('flowId').equals(flowId).toArray();

    // Convert database format to ReactFlow format
    const flowNodes = nodes.map((node) => ({
      id: node.nodeId,
      type: node.type,
      data: node.data,
      position: node.position,
    }));

    const flowEdges = edges.map((edge) => ({
      id: edge.edgeId,
      source: edge.source,
      target: edge.target,
      data: edge.data,
    }));

    return { nodes: flowNodes, edges: flowEdges };
  };

  // Save flow data by flowId
  const saveFlowData = async (flowId: string, nodes: any[], edges: any[], documentId: number) => {
    await db.transaction('rw', db.nodes, db.edges, async () => {
      // Delete existing nodes and edges for this flow
      await db.nodes.where('flowId').equals(flowId).delete();
      await db.edges.where('flowId').equals(flowId).delete();

      // Add new nodes
      if (nodes.length > 0) {
        const nodesToSave = nodes.map((node) => ({
          documentId,
          flowId,
          nodeId: node.id,
          type: node.type || 'default',
          data: node.data || {},
          position: node.position,
        }));
        await db.nodes.bulkAdd(nodesToSave);
      }

      // Add new edges
      if (edges.length > 0) {
        const edgesToSave = edges.map((edge) => ({
          documentId,
          flowId,
          edgeId: edge.id,
          source: edge.source,
          target: edge.target,
          data: edge.data,
        }));
        await db.edges.bulkAdd(edgesToSave);
      }
    });
  };

  // Delete flow data by flowId
  const deleteFlowData = async (flowId: string) => {
    await db.nodes.where('flowId').equals(flowId).delete();
    await db.edges.where('flowId').equals(flowId).delete();
  };

  // Save ERD diagram
  const saveDiagram = async (diagramId: string, data: { nodes: any[]; edges: any[]; name?: string }) => {
    const { nodes, edges, name } = data;

    // Create or update a diagram entry in diagrams store
    const diagramData = {
      id: diagramId,
      name: name || 'Untitled ERD Diagram',
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // @ts-ignore - diagrams table
    if (!db.diagrams) {
      // @ts-ignore - create object store
      const store = db.createObjectStore('diagrams', 'id');
    }

    // @ts-ignore
    await db.diagrams.put(diagramData);

    // Also save as flow data for compatibility
    await saveFlowData(diagramId, nodes, edges, 0);

    return diagramId;
  };

  // Load ERD diagram
  const loadDiagram = async (diagramId: string) => {
    // @ts-ignore
    const diagramData = await db.diagrams?.get(diagramId);

    if (diagramData) {
      return {
        name: diagramData.name,
        nodes: JSON.parse(diagramData.nodes || '[]'),
        edges: JSON.parse(diagramData.edges || '[]'),
      };
    }

    // Fallback to flow data
    const flowData = await loadFlowData(diagramId);
    if (flowData.nodes.length > 0 || flowData.edges.length > 0) {
      return {
        name: 'ERD Diagram',
        nodes: flowData.nodes,
        edges: flowData.edges,
      };
    }

    return null;
  };

  // Get all diagrams
  const getAllDiagrams = async () => {
    // @ts-ignore
    if (!db.diagrams) {
      return [];
    }
    // @ts-ignore
    return await db.diagrams.toArray();
  };

  return {
    documents: documents || [],
    loadDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    saveNodes,
    saveEdges,
    exportDocument,
    importDocument,
    loadFlowData,
    saveFlowData,
    deleteFlowData,
    saveDiagram,
    loadDiagram,
    getAllDiagrams,
  };
}
