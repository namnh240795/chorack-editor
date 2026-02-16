# Chorack Editor - Project Overview

## Project Purpose

Chorack Editor is a modern web-based document editor with rich text editing capabilities and flow chart integration. It allows users to create, edit, and manage documents with embedded flow diagrams.

## Tech Stack

### Frontend Framework
- **React 19.2** - UI library
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite 7.3** - Build tool and dev server

### Editor & Rich Text
- **Tiptap 3.19** - ProseMirror-based rich text editor
  - `@tiptap/react` - React integration
  - `@tiptap/starter-kit` - Standard extensions (headings, lists, etc.)
  - Custom extension for ReactFlow integration

### Flow Charts
- **ReactFlow 11.11** - Flow chart and node-based editor
- **D3 7.9** - Data visualization library (likely for ReactFlow)

### Database
- **Dexie 4.3** - IndexedDB wrapper for client-side storage
- **dexie-react-hooks 4.2** - React hooks for Dexie

### State Management
- **Zustand 5.0** - Lightweight state management

### Styling
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **PostCSS 8.5** - CSS processing
- **Autoprefixer 10.4** - CSS vendor prefixes

### Icons & UI
- **Lucide React 0.564** - Icon library

### Utilities
- **clsx 2.1** - Conditional className utility
- **tailwind-merge 3.4** - Merge Tailwind classes without conflicts

### Development Tools
- **ESLint 9.39** - Code linting with TypeScript, React Hooks, and React Refresh plugins
- **Playwright 1.58** - End-to-end testing and visual testing
- **tsx 4.21** - TypeScript execution

## Project Structure

```
src/
├── App.tsx                 # Main app component with routing and theme toggle
├── main.tsx               # Application entry point
├── index.css              # Global styles and ProseMirror editor styles
│
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx     # Button component with variants
│   │   ├── Input.tsx      # Input component with error states
│   │   ├── Modal.tsx      # Modal and ConfirmModal components
│   │   └── Toast.tsx      # Toast notification system
│   │
│   ├── DocumentManager.tsx    # Document list with search/filter/grid
│   ├── DocumentEditor/        # Document editing page
│   │   └── DocumentEditor.tsx # Editor with title, save status, stats
│   ├── TiptapEditor/          # Rich text editor component
│   │   ├── TiptapEditor.tsx   # Main editor with toolbar
│   │   ├── ReactFlowWrapper.tsx
│   │   ├── ReactFlowCanvas.tsx
│   │   ├── FlowFullscreenModal.tsx
│   │   ├── ResizeHandle.tsx
│   │   └── extensions/
│   │       ├── ReactFlowExtension.ts
│   │       └── ReactFlowNodeView.tsx
│   └── EditorOutline.tsx      # Document outline sidebar
│
├── hooks/
│   ├── useEditorDB.ts         # Database operations hook
│   └── useFlowPersistence.ts  # Flow chart persistence hook
│
├── db/
│   ├── database.ts            # Dexie database setup
│   └── types.ts               # TypeScript interfaces
│
└── lib/
    └── utils.ts               # Utility functions (cn, formatDate, etc.)
```

## Data Model

### EditorDocument
- `id?: number` - Auto-increment primary key
- `title: string` - Document title
- `content: string` - HTML content from Tiptap
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Last update timestamp

### EditorNode (for flow charts)
- `id?: number` - Auto-increment primary key
- `documentId: number` - Foreign key to document
- `nodeId: string` - ReactFlow node ID
- `type: string` - Node type
- `data: any` - Node data
- `position: {x, y}` - Node position
- `flowId?: string` - Optional flow chart grouping

### EditorEdge (for flow chart connections)
- `id?: number` - Auto-increment primary key
- `documentId: number` - Foreign key to document
- `edgeId: string` - ReactFlow edge ID
- `source: string` - Source node ID
- `target: string` - Target node ID
- `data?: any` - Edge data
- `flowId?: string` - Optional flow chart grouping

## Database Schema

IndexedDB database name: `ChorackEditorDB`
- Version 1
- Tables: documents, nodes, edges
- Indexed fields for efficient queries
