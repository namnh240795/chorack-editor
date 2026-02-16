# 🎯 ReactFlow Sample - Quick Start Guide

## 🚀 Method 1: Browser Console Script (Recommended)

### Step-by-Step:

1. **Start the dev server**
   ```bash
   pnpm dev
   ```

2. **Open your browser**
   Go to: http://localhost:5173

3. **Open Browser DevTools**
   - **Mac**: `Cmd + Option + I`
   - **Windows/Linux**: `F12` or `Ctrl + Shift + I`

4. **Go to Console tab**
   Click on "Console" in the DevTools panel

5. **Copy the sample script**
   Open file: `scripts/create-sample-browser.js`
   Select all (Cmd+A / Ctrl+A)
   Copy (Cmd+C / Ctrl+C)

6. **Paste in Console & Press Enter**
   Paste the script (Cmd+V / Ctrl+V)
   Press Enter to execute

7. **Refresh the page**
   Press `Cmd+R` or `F5` to refresh

8. **Open the demo document**
   Click on "🎯 ReactFlow Demo - Inline Layout & Scaling"

## ✨ What You'll See

### Example 1: Two Diagrams Side by Side
```
┌─────────────┐  ┌─────────────┐
│  Flow Chart  │  │  Flow Chart  │
│    400x300   │  │    400x300   │
└─────────────┘  └─────────────┘
```

### Example 2: Large Diagram (800x400)
```
┌────────────────────────────────┐
│                                │
│     Large Flow Chart            │
│       6 nodes, 5 edges         │
│                                │
└────────────────────────────────┘
```

### Example 3: Three Small Diagrams
```
┌──────┐  ┌──────┐  ┌──────┐
│  1   │  │  2   │  │  3   │
│ 300x │  │ 300x │  │ 300x │
│ 250  │  │ 250  │  │ 250  │
└──────┘  └──────┘  └──────┘
```

## 🎮 Testing Features

### 1. Resize Diagrams
- **Hover** over any edge or corner
- See the resize handle appear
- **Drag** to resize
- **Limits**: Min 300x200, Max 1200x800

### 2. Fullscreen Mode
- Click the **fullscreen button** (top-right corner)
- Edit in fullscreen
- Click "Done" to exit

### 3. Inline Layout
- Multiple diagrams automatically flow inline
- Like images in a document
- Wrap based on container width

### 4. Background Scaling
- White background scales with container
- Dot pattern from ReactFlow
- No extra white space

## 🛠️ Manual Creation (Alternative)

If the script doesn't work, you can create manually:

### Create Document with Flow Charts

1. **Click "New Document" button**

2. **Add Flow Charts using TipTap editor**
   Type: `/flow` and press Enter
   Or insert from toolbar (if available)

3. **Resize to desired dimensions**
   Drag corners/edges to resize

4. **Add multiple diagrams**
   Each `/flow` creates a new diagram
   They will flow inline automatically

## 📝 Sample Content Structure

The demo document contains:

```html
<h1>ReactFlow Demo</h1>

<h2>Example 1: Two Side-by-Side</h2>
<react-flow-node-view flow-id="demo-1" width="400" height="300">
</react-flow-node-view>
<react-flow-node-view flow-id="demo-2" width="400" height="300">
</react-flow-node-view>

<h2>Example 2: Large Diagram</h2>
<react-flow-node-view flow-id="demo-3" width="800" height="400">
</react-flow-node-view>

<h2>Example 3: Three Small</h2>
<react-flow-node-view flow-id="demo-4" width="300" height="250">
</react-flow-node-view>
<react-flow-node-view flow-id="demo-5" width="300" height="250">
</react-flow-node-view>
<react-flow-node-view flow-id="demo-6" width="300" height="250">
</react-flow-node-view>
```

## 🧹 Clean Up

To remove sample and start fresh:

### Method 1: Browser DevTools
```javascript
// In Console tab:
indexedDB.deleteDatabase('chorack-editor');
// Then refresh
```

### Method 2: Application UI
- Delete the demo document from the document list
- All flow data will be removed with it

## 📚 Additional Resources

- **Component Code**: `src/components/TiptapEditor/ReactFlowWrapper.tsx`
- **Canvas Code**: `src/components/TiptapEditor/ReactFlowCanvas.tsx`
- **Resize Handles**: `src/components/TiptapEditor/ResizeHandle.tsx`
- **Database**: `src/db/database.ts` (Dexie.js)

## ❓ Troubleshooting

### Script not working?
- Make sure you're on http://localhost:5173
- Check browser console for errors
- Try copying the script again carefully

### Diagrams not showing?
- Refresh the page after running script
- Check that ReactFlowProvider is in App.tsx
- Look for console errors

### Can't resize?
- Make sure you're hovering over edges/corners
- Check that ResizeHandle components exist
- Verify CSS is loading correctly

### Background not scaling?
- Verify `overflow: hidden` on container
- Check `background: white` on outer div
- Ensure ReactFlow has `width: 100%, height: 100%`

## 🎉 Success!

Once loaded, you should see:
- ✅ 6 flow diagrams
- ✅ Inline layout working
- ✅ Resize handles on all edges/corners
- ✅ Fullscreen buttons
- ✅ Scaling backgrounds

**Happy testing!** 🚀
