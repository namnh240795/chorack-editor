import { EntityNode } from './EntityNode';
import type { NodeTypes } from 'reactflow';

/**
 * Node Registry for different diagram types
 *
 * This registry maps diagram types (erd, flowchart, etc.) to their
 * corresponding custom node components.
 *
 * To add a new diagram type:
 * 1. Create custom node components in src/components/TiptapEditor/nodes/
 * 2. Add an entry here with the diagram type as key
 * 3. Update the DiagramTypeDropdown to include the new type
 */
export const nodeRegistry = {
  erd: {
    entity: EntityNode,
  },
  flowchart: {
    // For flowchart, we use default ReactFlow nodes
    // Add custom flowchart nodes here if needed in the future
  },
} as const;

export type DiagramType = keyof typeof nodeRegistry;

// Pre-compute stable nodeTypes objects for each diagram type
const erdNodeTypes: NodeTypes = {
  entity: EntityNode,
};

const flowchartNodeTypes: NodeTypes = {};

// Create a stable mapping of diagram types to their node types
const nodeTypesCache: Record<DiagramType, NodeTypes> = {
  erd: erdNodeTypes,
  flowchart: flowchartNodeTypes,
};

/**
 * Get the node types configuration for a specific diagram type
 * Returns a stable, memoized object to prevent ReactFlow re-renders
 */
export function getNodeTypesForDiagram(diagramType: DiagramType): NodeTypes {
  return nodeTypesCache[diagramType] || {};
}

/**
 * Get available diagram types
 */
export function getDiagramTypes(): DiagramType[] {
  return Object.keys(nodeRegistry) as DiagramType[];
}
