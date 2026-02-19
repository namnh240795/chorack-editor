import type { ElkNode } from 'elkjs/lib/elk-api';
import type { Node, Edge } from 'reactflow';
import ELK from 'elkjs/lib/elk.bundled.js';

// Initialize ELK instance
const elk = new ELK();

/**
 * Layout direction options for ELK
 */
export type LayoutDirection = 'RIGHT' | 'DOWN' | 'LEFT' | 'UP';

/**
 * Layout algorithm options
 */
export type LayoutAlgorithm = 
  | 'layered'      // Hierarchical layout (good for ERDs)
  | 'force'        // Force-directed layout
  | 'mrtree'       // Tree/radial layout
  | 'radial'       // Radial layout
  | 'circle'       // Circular layout
  | 'disco';       // Discrete layout

/**
 * Configuration for ELK layout
 */
export interface ElkLayoutConfig {
  direction?: LayoutDirection;
  algorithm?: LayoutAlgorithm;
  nodeSpacing?: number;
  edgeSpacing?: number;
  layerSpacing?: number;
  aspectRatio?: number;
  separateConnectedComponents?: boolean;
}

/**
 * Default layout configuration optimized for ERD diagrams
 */
const DEFAULT_ERD_CONFIG: ElkLayoutConfig = {
  direction: 'DOWN',
  algorithm: 'layered',
  nodeSpacing: 120,
  edgeSpacing: 60,
  layerSpacing: 150,
  separateConnectedComponents: true,
  aspectRatio: 1.6,
};

/**
 * Convert ReactFlow nodes and edges to ELK graph format
 */
function toElkGraph(
  nodes: Node[],
  edges: Edge[],
  config: ElkLayoutConfig = {}
): ElkNode {
  const effectiveConfig = { ...DEFAULT_ERD_CONFIG, ...config };

  // Get valid node IDs
  const validNodeIds = new Set(nodes.map(n => n.id));

  // Filter edges to only include those with valid source and target nodes
  const validEdges = edges.filter(
    edge => validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
  );

  return {
    id: 'root',
    layoutOptions: {
      'elk.direction': effectiveConfig.direction || 'DOWN',
      'elk.algorithm': effectiveConfig.algorithm || 'layered',
      'elk.spacing.nodeNode': `${effectiveConfig.nodeSpacing || 120}`,
      'elk.spacing.edgeNode': `${effectiveConfig.edgeSpacing || 60}`,
      'elk.layered.spacing.nodeNodeBetweenLayers': `${effectiveConfig.layerSpacing || 150}`,
      'elk.separateConnectedComponents': `${effectiveConfig.separateConnectedComponents !== false}`,
      'elk.aspectRatio': `${effectiveConfig.aspectRatio || 1.6}`,
      // ERD-specific optimizations
      'elk.layered.cycleBreaking.strategy': 'GREEDY',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.crossingMinimization.semiInteractive': 'true',
      'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
      // Port settings for better edge routing
      'elk.port.clustering.threshold': '0',
      'elk.layered.edgeRouting.strategy': 'ORTHOGONAL',
      'elk.layered.edgeRouting.orthogonalPreferred': 'true',
      'elk.spacing.edgeNodeSpacing': '40',
      'elk.spacing.edgeSpacing': '30',
    },
    children: nodes.map((node) => ({
      id: node.id,
      // Estimate size based on entity data (header + attributes)
      width: 220,
      height: 60 + (node.data.attributes?.length || 1) * 40,
      // Preserve node-specific properties
      properties: {
        'elk.padding': '[top=15,left=15,bottom=15,right=15]',
        'elk.nodeLabels.placement': 'INSIDE V_CENTER H_CENTER',
      },
    })),
    edges: validEdges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };
}

/**
 * Apply ELK layout to ReactFlow nodes and edges
 * 
 * @param nodes - ReactFlow nodes
 * @param edges - ReactFlow edges
 * @param config - Layout configuration
 * @returns Promise with positioned nodes and original edges
 */
export async function applyElkLayout(
  nodes: Node[],
  edges: Edge[],
  config: ElkLayoutConfig = {}
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (nodes.length === 0) {
    return { nodes: [], edges };
  }

  try {
    // Convert to ELK graph format
    const elkGraph = toElkGraph(nodes, edges, config);

    // Apply ELK layout
    const layoutedGraph = await elk.layout(elkGraph);

    // Map layouted positions back to ReactFlow nodes
    const layoutedNodes = nodes.map((node) => {
      const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
      if (!layoutedNode) {
        return node;
      }

      return {
        ...node,
        position: {
          x: layoutedNode.x || 0,
          y: layoutedNode.y || 0,
        },
      };
    });

    return {
      nodes: layoutedNodes,
      edges,
    };
  } catch (error) {
    console.error('ELK layout failed:', error);
    // Return original nodes on error
    return { nodes, edges };
  }
}

/**
 * Quick layout presets for common ERD scenarios
 */
export const LayoutPresets: Record<string, ElkLayoutConfig> = {
  // Standard hierarchical layout (left to right)
  hierarchical: {
    direction: 'RIGHT',
    algorithm: 'layered',
    nodeSpacing: 80,
    edgeSpacing: 40,
    layerSpacing: 100,
  },

  // Top-down hierarchy
  topDown: {
    direction: 'DOWN',
    algorithm: 'layered',
    nodeSpacing: 80,
    edgeSpacing: 40,
    layerSpacing: 100,
  },

  // Compact layout for smaller diagrams
  compact: {
    direction: 'RIGHT',
    algorithm: 'layered',
    nodeSpacing: 50,
    edgeSpacing: 30,
    layerSpacing: 80,
  },

  // Spacious layout for large diagrams
  spacious: {
    direction: 'RIGHT',
    algorithm: 'layered',
    nodeSpacing: 120,
    edgeSpacing: 60,
    layerSpacing: 150,
  },

  // Force-directed (good for complex relationships)
  force: {
    direction: 'RIGHT',
    algorithm: 'force',
    nodeSpacing: 80,
  },

  // Radial layout (good for star schemas)
  radial: {
    direction: 'RIGHT',
    algorithm: 'radial',
    nodeSpacing: 80,
  },
};

/**
 * Apply a preset layout by name
 */
export async function applyPresetLayout(
  nodes: Node[],
  edges: Edge[],
  presetName: keyof typeof LayoutPresets
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const config = LayoutPresets[presetName];
  if (!config) {
    console.warn(`Unknown layout preset: ${presetName}`);
    return { nodes, edges };
  }

  return applyElkLayout(nodes, edges, config);
}
