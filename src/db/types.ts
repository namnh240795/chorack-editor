export interface EditorDocument {
  id?: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ERDDiagram {
  id?: number;
  name: string;
  description?: string;
  nodes: string; // JSON stringified nodes
  edges: string; // JSON stringified edges
  createdAt: Date;
  updatedAt: Date;
}

export interface EditorNode {
  id?: number;
  documentId: number;
  nodeId: string;
  type: string;
  data: any;
  position: { x: number; y: number };
  flowId?: string;
}

export interface EditorEdge {
  id?: number;
  documentId: number;
  edgeId: string;
  source: string;
  target: string;
  data?: any;
  flowId?: string;
}
