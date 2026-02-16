import Dexie, { type Table } from 'dexie';
import type { EditorDocument, EditorNode, EditorEdge, ERDDiagram } from './types';

export class EditorDatabase extends Dexie {
  documents!: Table<EditorDocument>;
  nodes!: Table<EditorNode>;
  edges!: Table<EditorEdge>;
  erdDiagrams!: Table<ERDDiagram>;

  constructor() {
    super('ChorackEditorDB');

    this.version(2).stores({
      documents: '++id, title, createdAt, updatedAt',
      nodes: '++id, documentId, flowId, nodeId, type',
      edges: '++id, documentId, flowId, edgeId, source, target',
      erdDiagrams: '++id, name, description, nodes, edges, createdAt, updatedAt',
    });
  }
}

export const db = new EditorDatabase();
