/**
 * Generate sample document with multiple ReactFlow diagrams
 * This demonstrates inline layout and scaling features
 */

import { db } from '../src/db/database.js';

const sampleDocuments = [
  {
    id: 1,
    title: 'ReactFlow Demo - Multiple Diagrams',
    content: `
      <h2>ReactFlow Inline Layout Demo</h2>
      <p>This document demonstrates the new ReactFlow features:</p>
      <ul>
        <li>✅ Multiple diagrams on the same line</li>
        <li>✅ Scalable in both directions</li>
        <li>✅ Background scales with container</li>
      </ul>

      <h3>Example 1: Two Small Flow Charts Side by Side</h3>
      <p>These two diagrams are on the same line:</p>

      <react-flow-node-view
        flow-id="flow-1"
        width="400"
        height="300"
      ></react-flow-node-view>

      <react-flow-node-view
        flow-id="flow-2"
        width="400"
        height="300"
      ></react-flow-node-view>

      <h3>Example 2: Large Diagram Below</h3>
      <p>This is a larger diagram that can be resized:</p>

      <react-flow-node-view
        flow-id="flow-3"
        width="800"
        height="400"
      ></react-flow-node-view>

      <h3>Example 3: Three Small Diagrams in a Row</h3>
      <p>Demonstrating inline layout with three diagrams:</p>

      <react-flow-node-view
        flow-id="flow-4"
        width="300"
        height="250"
      ></react-flow-node-view>

      <react-flow-node-view
        flow-id="flow-5"
        width="300"
        height="250"
      ></react-flow-node-view>

      <react-flow-node-view
        flow-id="flow-6"
        width="300"
        height="250"
      ></react-flow-node-view>

      <h2>How to Use</h2>
      <ol>
        <li>Click and drag the resize handles (corners/edges) to resize</li>
        <li>Use the fullscreen button to expand to full screen</li>
        <li>Add multiple diagrams by typing /flow in the editor</li>
        <li>Diagrams will automatically flow inline (like images)</li>
      </ol>
    `,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample flow data
const sampleFlows = [
  {
    flowId: 'flow-1',
    nodes: [
      { id: '1', type: 'input', data: { label: 'Start' }, position: { x: 50, y: 50 } },
      { id: '2', data: { label: 'Process A' }, position: { x: 150, y: 50 } },
      { id: '3', type: 'output', data: { label: 'End' }, position: { x: 280, y: 50 } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' }
    ]
  },
  {
    flowId: 'flow-2',
    nodes: [
      { id: '1', type: 'input', data: { label: 'Input' }, position: { x: 50, y: 80 } },
      { id: '2', data: { label: 'Decision' }, position: { x: 150, y: 80 } },
      { id: '3', data: { label: 'Yes' }, position: { x: 280, y: 40 } },
      { id: '4', data: { label: 'No' }, position: { x: 280, y: 120 } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3', label: 'yes' },
      { id: 'e2-4', source: '2', target: '4', label: 'no' }
    ]
  },
  {
    flowId: 'flow-3',
    nodes: [
      { id: '1', type: 'input', data: { label: 'User Action' }, position: { x: 50, y: 100 } },
      { id: '2', data: { label: 'Validate' }, position: { x: 200, y: 100 } },
      { id: '3', data: { label: 'Process' }, position: { x: 350, y: 100 } },
      { id: '4', data: { label: 'Save to DB' }, position: { x: 500, y: 100 } },
      { id: '5', type: 'output', data: { label: 'Complete' }, position: { x: 650, y: 100 } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' }
    ]
  },
  {
    flowId: 'flow-4',
    nodes: [
      { id: '1', type: 'input', data: { label: 'A' }, position: { x: 50, y: 50 } },
      { id: '2', data: { label: 'B' }, position: { x: 140, y: 50 } },
      { id: '3', type: 'output', data: { label: 'C' }, position: { x: 220, y: 50 } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' }
    ]
  },
  {
    flowId: 'flow-5',
    nodes: [
      { id: '1', type: 'input', data: { label: 'X' }, position: { x: 50, y: 50 } },
      { id: '2', data: { label: 'Y' }, position: { x: 140, y: 50 } },
      { id: '3', type: 'output', data: { label: 'Z' }, position: { x: 220, y: 50 } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' }
    ]
  },
  {
    flowId: 'flow-6',
    nodes: [
      { id: '1', type: 'input', data: { label: 'P' }, position: { x: 50, y: 50 } },
      { id: '2', data: { label: 'Q' }, position: { x: 140, y: 50 } },
      { id: '3', type: 'output', data: { label: 'R' }, position: { x: 220, y: 50 } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' }
    ]
  }
];

async function generateSample() {
  console.log('🎨 Generating sample ReactFlow document...\n');

  try {
    // Clear existing data
    await db.documents.clear();
    await db.nodes.clear();
    await db.edges.clear();
    console.log('✅ Cleared existing data\n');

    // Add document
    await db.documents.add(sampleDocuments[0]);
    console.log('✅ Created document: "' + sampleDocuments[0].title + '"\n');

    // Add flow data
    for (const flow of sampleFlows) {
      // Add nodes
      for (const node of flow.nodes) {
        await db.nodes.add({
          documentId: 1,
          flowId: flow.flowId,
          nodeId: node.id,
          type: node.type || 'default',
          data: node.data,
          position: node.position
        });
      }

      // Add edges
      for (const edge of flow.edges) {
        await db.edges.add({
          documentId: 1,
          flowId: flow.flowId,
          edgeId: edge.id,
          source: edge.source,
          target: edge.target,
          data: { label: edge.label }
        });
      }

      console.log(`✅ Created flow: ${flow.flowId} (${flow.nodes.length} nodes, ${flow.edges.length} edges)`);
    }

    console.log('\n🎉 Sample generation complete!');
    console.log('\n📝 What you can test:');
    console.log('   • Resize diagrams using drag handles');
    console.log('   • See 2 diagrams on line 1');
    console.log('   • See large diagram below');
    console.log('   • See 3 small diagrams in a row');
    console.log('\n🌐 Open http://localhost:5173 in your browser to see the demo!');

  } catch (error) {
    console.error('❌ Error generating sample:', error);
    process.exit(1);
  }
}

generateSample();
