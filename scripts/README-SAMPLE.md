# ReactFlow Sample Generator

This script creates a sample document demonstrating the new ReactFlow features:
- ✅ Inline layout (multiple diagrams on same line)
- ✅ Scalable containers (resize in 8 directions)
- ✅ Background scaling (white background scales with container)

## Usage

### Quick Start

```bash
# Install tsx if not already installed
pnpm add -D tsx

# Generate sample data
npx tsx scripts/sample-generator.ts

# Start dev server
pnpm dev

# Open browser
open http://localhost:5173
```

### Manual Steps

1. **Generate Sample Data**
   ```bash
   npx tsx scripts/sample-generator.ts
   ```
   This creates a document called "🎯 ReactFlow Demo - Inline Layout & Scaling"

2. **Start Application**
   ```bash
   pnpm dev
   ```

3. **Open Document**
   - Go to http://localhost:5173
   - Click on "🎯 ReactFlow Demo - Inline Layout & Scaling"

## What You'll See

### Example 1: Two Diagrams Side by Side
```
[Flow Chart 1] [Flow Chart 2]
   400x300       400x300
```

### Example 2: Large Diagram
```
┌────────────────────────────┐
│                            │
│      800x400 Diagram        │
│      (6 nodes, 5 edges)     │
│                            │
└────────────────────────────┘
```

### Example 3: Three Small Diagrams
```
[1] [2] [3]
300x250 each
```

## Testing Features

### 1. Resize Handles
- **8 directions**: N, S, E, W, NE, NW, SE, SW
- **Min size**: 300x200
- **Max size**: 1200x800
- **Hover** over edges/corners to see handles

### 2. Fullscreen Mode
- Click fullscreen button (top-right of diagram)
- Edit in fullscreen
- Click "Done" to close

### 3. Inline Layout
- Diagrams flow inline (like images)
- Can have multiple on same line
- Responsive to container width

### 4. Background Scaling
- White background scales with container
- Dot pattern from ReactFlow Background component
- No extra white space when resizing

## Sample Data Structure

Each flow has:
- **Nodes**: Input/Output/Default types
- **Edges**: Connections between nodes
- **Labels**: Optional text on edges
- **Positions**: X, Y coordinates

## Troubleshooting

### Diagrams not showing?
- Check browser console for errors
- Verify ReactFlowProvider is in App.tsx
- Check that flowId matches between extension and database

### Resize not working?
- Verify ResizeHandle components are mounted
- Check that onResizeStart/onResizeEnd are called
- Look for CSS conflicts

### Background not scaling?
- Verify `overflow: hidden` on container
- Check `background: white` on outer div
- Ensure ReactFlow has `width: 100%, height: 100%`

## File Locations

- **Generator**: `scripts/sample-generator.ts`
- **Database**: `src/db/database.ts` (Dexie)
- **Components**:
  - `src/components/TiptapEditor/ReactFlowWrapper.tsx`
  - `src/components/TiptapEditor/ReactFlowCanvas.tsx`
  - `src/components/TiptapEditor/ResizeHandle.tsx`

## Clean Up

To remove sample data and start fresh:

```bash
# Open browser DevTools Console
indexedDB.deleteDatabase('chorack-editor')
# Then refresh page
```

Or manually delete documents from the UI.
