# Playwright MCP Testing Guide

Playwright MCP has been successfully installed for this project!

## Configuration

MCP server configuration: `.vscode/mcp.json`

## Available Playwright MCP Tools

Once connected, Playwright MCP provides these tools:
- Browser automation (navigate, click, fill, etc.)
- Screenshots and visual regression
- Element inspection
- Page interaction testing

## Testing the ReactFlow Scaling Fix

To test the ReactFlow background scaling fix using Playwright MCP:

1. **Start the dev server:**
   ```bash
   pnpm dev
   ```

2. **Create a new document** with a ReactFlow extension

3. **Use Playwright MCP to:**
   - Navigate to http://localhost:5173
   - Open/create a document
   - Insert ReactFlow extension
   - Resize the canvas using drag handles
   - Take screenshots before/after resize
   - Verify background scales properly

## Example Playwright MCP Test Flow

```
1. Navigate to localhost:5173
2. Click "New Document"
3. Add ReactFlow extension
4. Take initial screenshot
5. Resize canvas (simulate drag)
6. Take resized screenshot
7. Compare background scaling
```

## Manual Testing

If you want to manually test:
1. Run `pnpm dev`
2. Open http://localhost:5173
3. Create a document
4. Add a ReactFlow node
5. Use the resize handles to resize the canvas
6. Verify the dot background scales proportionally with the canvas size

The fix ensures that when you resize the ReactFlow canvas, the background pattern scales along with it correctly.
