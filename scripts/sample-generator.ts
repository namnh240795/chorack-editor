#!/usr/bin/env tsx
/**
 * Quick sample generator for ReactFlow demo
 * Run: npx tsx scripts/sample-generator.ts
 */

import { db } from '../src/db/database.js';

interface Node {
  id: string;
  type?: string;
  data: { label: string };
  position: { x: number; y: number };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface FlowData {
  flowId: string;
  nodes: Node[];
  edges: Edge[];
}

async function createSampleDocument() {
  console.log('🎨 Creating ReactFlow sample document...\n');

  // Create document
  const docId = await db.documents.add({
    title: '🎯 ReactFlow Demo - Inline Layout & Scaling',
    content: `
<h1>ReactFlow Demo Document</h1>

<h2>✨ Features to Test:</h2>
<ul>
  <li><strong>Inline Layout:</strong> Multiple diagrams on the same line</li>
  <li><strong>Scaling:</strong> Resize using drag handles (8 directions)</li>
  <li><strong>Background:</strong> White background scales with container</li>
</ul>

<h2>📊 Example 1: Two Diagrams Side by Side</h2>
<p>These two 400x300 diagrams sit on the same line:</p>

<react-flow-node-view flow-id="demo-1" width="400" height="300"></react-flow-node-view>
<react-flow-node-view flow-id="demo-2" width="400" height="300"></react-flow-node-view>

<h2>📐 Example 2: Large Diagram (800x400)</h2>
<p>A larger resizable diagram:</p>

<react-flow-node-view flow-id="demo-3" width="800" height="400"></react-flow-node-view>

<h2>🔢 Example 3: Three Small Diagrams (300x250 each)</h2>
<p>Three diagrams flowing inline:</p>

<react-flow-node-view flow-id="demo-4" width="300" height="250"></react-flow-node-view>
<react-flow-node-view flow-id="demo-5" width="300" height="250"></react-flow-node-view>
<react-flow-node-view flow-id="demo-6" width="300" height="250"></react-flow-node-view>

<h2>💡 How to Use:</h2>
<ol>
  <li><strong>Resize:</strong> Drag any corner or edge handle</li>
  <li><strong>Fullscreen:</strong> Click the fullscreen button (top-right)</li>
  <li><strong>Add New:</strong> Type <code>/flow</code> in the editor</li>
  <li><strong>Inline:</strong> Diagrams auto-flow like inline images</li>
</ol>

<hr>

<h3>Technical Notes:</h3>
<ul>
  <li>Minimum size: 300x200</li>
  <li>Maximum size: 1200x800</li>
  <li>Zoom range: 0.2x to 2x</li>
  <li>Background: White with dot pattern</li>
</ul>
    `,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log(`✅ Created document (ID: ${docId})`);

  // Sample flow data
  const flows: FlowData[] = [
    {
      flowId: 'demo-1',
      nodes: [
        { id: '1', type: 'input', data: { label: 'Start' }, position: { x: 50, y: 50 } },
        { id: '2', data: { label: 'Process A' }, position: { x: 150, y: 50 } },
        { id: '3', type: 'output', data: { label: 'End' }, position: { x: 280, y: 50 } }
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' }
      ]
    },
    {
      flowId: 'demo-2',
      nodes: [
        { id: '1', type: 'input', data: { label: 'Input' }, position: { x: 50, y: 80 } },
        { id: '2', data: { label: 'Check' }, position: { x: 150, y: 80 } },
        { id: '3', data: { label: 'Pass ✓' }, position: { x: 280, y: 40 } },
        { id: '4', data: { label: 'Fail ✗' }, position: { x: 280, y: 120 } }
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3', label: 'yes' },
        { id: 'e3', source: '2', target: '4', label: 'no' }
      ]
    },
    {
      flowId: 'demo-3',
      nodes: [
        { id: '1', type: 'input', data: { label: 'Start' }, position: { x: 50, y: 150 } },
        { id: '2', data: { label: 'Step 1' }, position: { x: 180, y: 150 } },
        { id: '3', data: { label: 'Step 2' }, position: { x: 310, y: 150 } },
        { id: '4', data: { label: 'Step 3' }, position: { x: 440, y: 150 } },
        { id: '5', data: { label: 'Step 4' }, position: { x: 570, y: 150 } },
        { id: '6', type: 'output', data: { label: 'Finish' }, position: { x: 700, y: 150 } }
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
        { id: 'e3', source: '3', target: '4' },
        { id: 'e4', source: '4', target: '5' },
        { id: 'e5', source: '5', target: '6' }
      ]
    },
    {
      flowId: 'demo-4',
      nodes: [
        { id: '1', type: 'input', data: { label: 'A→B' }, position: { x: 50, y: 50 } },
        { id: '2', data: { label: 'B→C' }, position: { x: 140, y: 50 } },
        { id: '3', type: 'output', data: { label: 'C→End' }, position: { x: 220, y: 50 } }
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' }
      ]
    },
    {
      flowId: 'demo-5',
      nodes: [
        { id: '1', type: 'input', data: { label: 'X→Y' }, position: { x: 50, y: 50 } },
        { id: '2', data: { label: 'Y→Z' }, position: { x: 140, y: 50 } },
        { id: '3', type: 'output', data: { label: 'Z→End' }, position: { x: 220, y: 50 } }
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' }
      ]
    },
    {
      flowId: 'demo-6',
      nodes: [
        { id: '1', type: 'input', data: { label: 'P→Q' }, position: { x: 50, y: 50 } },
        { id: '2', data: { label: 'Q→R' }, position: { x: 140, y: 50 } },
        { id: '3', type: 'output', data: { label: 'R→End' }, position: { x: 220, y: 50 } }
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' }
      ]
    }
  ];

  // Add all flows
  for (const flow of flows) {
    for (const node of flow.nodes) {
      await db.nodes.add({
        documentId: docId,
        flowId: flow.flowId,
        nodeId: node.id,
        type: node.type || 'default',
        data: node.data,
        position: node.position
      });
    }

    for (const edge of flow.edges) {
      await db.edges.add({
        documentId: docId,
        flowId: flow.flowId,
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        data: edge.label ? { label: edge.label } : {}
      });
    }

    console.log(`✅ Created flow "${flow.flowId}" (${flow.nodes.length} nodes, ${flow.edges.length} edges)`);
  }

  console.log('\n🎉 Sample generated successfully!');
  console.log('\n📖 Test Instructions:');
  console.log('   1. Open app: http://localhost:5173');
  console.log('   2. Open document "🎯 ReactFlow Demo"');
  console.log('   3. Test resize handles (corners & edges)');
  console.log('   4. Try fullscreen mode');
  console.log('   5. See diagrams flowing inline!\n');
}

// Run
createSampleDocument().catch(console.error);
