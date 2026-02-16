import { db } from '../db/database';
import type { ERDDiagram } from '../db/types';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Node, Edge } from 'reactflow';
import type { EntityNodeData } from '../components/TiptapEditor/nodes/EntityNode';

export function useERDDiagrams() {
  // Get all ERD diagrams (live query)
  const diagrams = useLiveQuery(() =>
    db.erdDiagrams.orderBy('updatedAt').reverse().toArray()
  );

  // Create a new ERD diagram
  const createDiagram = async (
    name: string,
    description?: string,
    nodes?: Node<EntityNodeData>[],
    edges?: Edge[]
  ) => {
    const now = new Date();
    const id = await db.erdDiagrams.add({
      name,
      description,
      nodes: JSON.stringify(nodes || []),
      edges: JSON.stringify(edges || []),
      createdAt: now,
      updatedAt: now,
    });
    return id;
  };

  // Update an ERD diagram
  const updateDiagram = async (
    id: number,
    updates: {
      name?: string;
      description?: string;
      nodes?: Node<EntityNodeData>[];
      edges?: Edge[];
    }
  ) => {
    const dataToUpdate: Partial<ERDDiagram> = {
      updatedAt: new Date(),
    };

    // Add name and description if provided
    if (updates.name !== undefined) {
      dataToUpdate.name = updates.name;
    }
    if (updates.description !== undefined) {
      dataToUpdate.description = updates.description;
    }

    // Convert nodes and edges to JSON strings if provided
    if (updates.nodes) {
      dataToUpdate.nodes = JSON.stringify(updates.nodes);
    }
    if (updates.edges) {
      dataToUpdate.edges = JSON.stringify(updates.edges);
    }

    await db.erdDiagrams.update(id, dataToUpdate);
  };

  // Delete an ERD diagram
  const deleteDiagram = async (id: number) => {
    await db.erdDiagrams.delete(id);
  };

  // Load a single ERD diagram with parsed nodes and edges
  const loadDiagram = async (id: number) => {
    const diagram = await db.erdDiagrams.get(id);
    if (!diagram) return null;

    return {
      ...diagram,
      nodes: JSON.parse(diagram.nodes) as Node<EntityNodeData>[],
      edges: JSON.parse(diagram.edges) as Edge[],
    };
  };

  // Export ERD diagram to JSON
  const exportDiagram = async (id: number) => {
    const diagram = await db.erdDiagrams.get(id);
    if (!diagram) return null;

    const nodes = JSON.parse(diagram.nodes);
    const edges = JSON.parse(diagram.edges);

    return JSON.stringify(
      {
        diagram,
        nodes,
        edges,
      },
      null,
      2
    );
  };

  // Import ERD diagram from JSON
  const importDiagram = async (json: string) => {
    const data = JSON.parse(json);
    const { diagram, nodes, edges } = data;

    const id = await db.erdDiagrams.add({
      name: diagram.name || 'Imported ERD Diagram',
      description: diagram.description,
      nodes: JSON.stringify(nodes || []),
      edges: JSON.stringify(edges || []),
      createdAt: new Date(diagram.createdAt),
      updatedAt: new Date(),
    });

    return id;
  };

  return {
    diagrams: diagrams || [],
    createDiagram,
    updateDiagram,
    deleteDiagram,
    loadDiagram,
    exportDiagram,
    importDiagram,
  };
}
