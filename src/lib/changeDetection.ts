import type { Node, Edge } from 'reactflow';

export type ChangeType = 'added' | 'modified' | 'deleted';

export interface NodeChange {
  nodeId: string;
  type: ChangeType;
  label: string;
}

export interface EdgeChange {
  edgeId: string;
  type: ChangeType;
  source: string;
  target: string;
}

export interface DiagramChanges {
  nodes: NodeChange[];
  edges: EdgeChange[];
}

/**
 * Compare two sets of nodes and edges to detect changes
 */
export function detectChanges(
  oldNodes: Node[],
  oldEdges: Edge[],
  newNodes: Node[],
  newEdges: Edge[]
): DiagramChanges {
  const nodeChanges: NodeChange[] = [];
  const edgeChanges: EdgeChange[] = [];

  // Create maps for easier lookup
  const oldNodesMap = new Map(oldNodes.map(n => [n.id, n]));
  const newNodesMap = new Map(newNodes.map(n => [n.id, n]));
  const oldEdgesMap = new Map(oldEdges.map(e => [e.id, e]));
  const newEdgesMap = new Map(newEdges.map(e => [e.id, e]));

  // Detect added nodes
  for (const [id, node] of newNodesMap) {
    if (!oldNodesMap.has(id)) {
      nodeChanges.push({
        nodeId: id,
        type: 'added',
        label: getNodeLabel(node),
      });
    }
  }

  // Detect deleted nodes
  for (const [id, node] of oldNodesMap) {
    if (!newNodesMap.has(id)) {
      nodeChanges.push({
        nodeId: id,
        type: 'deleted',
        label: getNodeLabel(node),
      });
    }
  }

  // Detect modified nodes
  for (const [id, newNode] of newNodesMap) {
    const oldNode = oldNodesMap.get(id);
    if (oldNode && isNodeModified(oldNode, newNode)) {
      nodeChanges.push({
        nodeId: id,
        type: 'modified',
        label: getNodeLabel(newNode),
      });
    }
  }

  // Detect added edges
  for (const [id, edge] of newEdgesMap) {
    if (!oldEdgesMap.has(id)) {
      edgeChanges.push({
        edgeId: id,
        type: 'added',
        source: edge.source,
        target: edge.target,
      });
    }
  }

  // Detect deleted edges
  for (const [id, edge] of oldEdgesMap) {
    if (!newEdgesMap.has(id)) {
      edgeChanges.push({
        edgeId: id,
        type: 'deleted',
        source: edge.source,
        target: edge.target,
      });
    }
  }

  // Detect modified edges
  for (const [id, newEdge] of newEdgesMap) {
    const oldEdge = oldEdgesMap.get(id);
    if (oldEdge && isEdgeModified(oldEdge, newEdge)) {
      edgeChanges.push({
        edgeId: id,
        type: 'modified',
        source: newEdge.source,
        target: newEdge.target,
      });
    }
  }

  return { nodes: nodeChanges, edges: edgeChanges };
}

/**
 * Get the display label for a node
 */
function getNodeLabel(node: Node): string {
  if (typeof node.data === 'object' && node.data !== null) {
    return (node.data as any).label || node.id;
  }
  return node.id;
}

/**
 * Check if a node has been modified
 */
function isNodeModified(oldNode: Node, newNode: Node): boolean {
  // Check if data changed
  const oldData = JSON.stringify(oldNode.data);
  const newData = JSON.stringify(newNode.data);

  // Check if position changed significantly
  const positionChanged =
    Math.abs(oldNode.position.x - newNode.position.x) > 5 ||
    Math.abs(oldNode.position.y - newNode.position.y) > 5;

  return oldData !== newData || positionChanged;
}

/**
 * Check if an edge has been modified
 */
function isEdgeModified(oldEdge: Edge, newEdge: Edge): boolean {
  return (
    oldEdge.source !== newEdge.source ||
    oldEdge.target !== newEdge.target ||
    oldEdge.label !== newEdge.label
  );
}

/**
 * Generate a human-readable summary of changes
 */
export function formatChangeSummary(changes: DiagramChanges): string {
  const parts: string[] = [];

  if (changes.nodes.length > 0) {
    const added = changes.nodes.filter(n => n.type === 'added').length;
    const modified = changes.nodes.filter(n => n.type === 'modified').length;
    const deleted = changes.nodes.filter(n => n.type === 'deleted').length;

    const nodeParts: string[] = [];
    if (added > 0) nodeParts.push(`${added} added`);
    if (modified > 0) nodeParts.push(`${modified} modified`);
    if (deleted > 0) nodeParts.push(`${deleted} deleted`);

    if (nodeParts.length > 0) {
      parts.push(`Entities: ${nodeParts.join(', ')}`);
    }
  }

  if (changes.edges.length > 0) {
    const added = changes.edges.filter(e => e.type === 'added').length;
    const modified = changes.edges.filter(e => e.type === 'modified').length;
    const deleted = changes.edges.filter(e => e.type === 'deleted').length;

    const edgeParts: string[] = [];
    if (added > 0) edgeParts.push(`${added} added`);
    if (modified > 0) edgeParts.push(`${modified} modified`);
    if (deleted > 0) edgeParts.push(`${deleted} deleted`);

    if (edgeParts.length > 0) {
      parts.push(`Relationships: ${edgeParts.join(', ')}`);
    }
  }

  return parts.length > 0 ? parts.join(' • ') : 'No changes';
}

/**
 * Get detailed change list for toast notification
 */
export function getDetailedChanges(changes: DiagramChanges): string {
  const lines: string[] = [];

  if (changes.nodes.length > 0) {
    lines.push('Entities:');
    for (const change of changes.nodes) {
      const icon = change.type === 'added' ? '➕' : change.type === 'deleted' ? '🗑️' : '✏️';
      lines.push(`  ${icon} ${change.label} (${change.type})`);
    }
  }

  if (changes.edges.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push('Relationships:');
    for (const change of changes.edges) {
      const icon = change.type === 'added' ? '➕' : change.type === 'deleted' ? '🗑️' : '✏️';
      lines.push(`  ${icon} ${change.source} → ${change.target} (${change.type})`);
    }
  }

  return lines.join('\n');
}
