# Coding Style & Conventions - Chorack Editor

## General Principles

- **TypeScript strict mode** is enabled
- **Functional components** with hooks (no class components)
- **Single responsibility** - Keep components focused
- **Composition over inheritance**

## File Naming

- **Components**: PascalCase - `DocumentManager.tsx`, `TiptapEditor.tsx`
- **Utilities**: camelCase - `utils.ts`, `useEditorDB.ts`
- **Types**: camelCase - `types.ts`
- **CSS**: lowercase with dots - `index.css`, `App.css`

## Component Structure

```tsx
// 1. Imports (external, then internal)
import { useState, useEffect } from 'react';
import { Button } from './ui/Button';

// 2. Type definitions
interface Props {
  // ...
}

// 3. Component declaration
export function ComponentName({ prop1, prop2 }: Props) {
  // 4. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState();
  
  // 5. Event handlers
  const handleClick = () => {
    // ...
  };
  
  // 6. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 7. Render helpers (computed values, memoized callbacks)
  const computedValue = useMemo(() => {
    // ...
  }, [deps]);
  
  // 8. Return JSX
  return (
    <div>...</div>
  );
}
```

## Imports Order

1. External libraries (React, third-party packages)
2. Internal imports (absolute imports with `@/`)
3. Relative imports (sibling files, `./` or `../`)
4. CSS imports

```tsx
// ✅ Good
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useEditorDB } from '../hooks/useEditorDB';
import './Component.css';

// ❌ Bad - mixed order
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
```

## TypeScript Conventions

### Type Definitions

- Use `interface` for object shapes
- Use `type` for unions, intersections, primitives
- Define types in separate files when reused
- Export types from dedicated `types.ts` files

```tsx
// ✅ Good - interface for objects
interface User {
  id: number;
  name: string;
}

// ✅ Good - type for unions
type Status = 'pending' | 'active' | 'completed';

// ✅ Good - optional props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}
```

### Type Imports

Always use `type` keyword for type-only imports:

```tsx
// ✅ Good
import type { EditorDocument } from '@/db/types';
import { Button } from './Button';

// ❌ Avoid
import { EditorDocument } from '@/db/types';  // When only using as type
```

## React Patterns

### Props Destructuring

```tsx
// ✅ Good - destructure in signature
function Component({ title, content, onSave }: Props) {
  // ...
}

// ❌ Avoid - accessing props directly
function Component(props: Props) {
  return <div>{props.title}</div>;
}
```

### Custom Hooks

- Prefix with `use`
- Return array for mutable values (useState-like)
- Return object for readonly/config values

```tsx
// ✅ Good - custom hook pattern
function useEditorDB() {
  const [documents, setDocuments] = useState<EditorDocument[]>([]);
  
  const createDocument = async (title: string) => {
    // ...
  };
  
  return { documents, createDocument, updateDocument, deleteDocument };
}
```

### Component Export

```tsx
// ✅ Good - named export
export function Button() { ... }

// Can also have default export
export default Button;
```

## Styling Conventions

### Tailwind CSS

- Use **utility classes** for styling
- Use **cn()** utility for conditional classes
- **Dark mode**: use `dark:` prefix

```tsx
// ✅ Good - using cn() for conditional classes
import { cn } from '@/lib/utils';

<button className={cn(
  'px-4 py-2 rounded',
  'bg-blue-600 hover:bg-blue-700',
  'dark:bg-blue-500 dark:hover:bg-blue-600',
  isActive && 'bg-blue-800',
  className
)}>
  Click me
</button>

// ❌ Avoid - template literals without cn()
<button className={`px-4 py-2 rounded ${isActive ? 'active' : ''}`}>
```

### Component Styling Pattern

```tsx
// Base classes + variants + conditional + custom
<div className={cn(
  // Base styles
  'border rounded-lg overflow-hidden',
  // Dark mode
  'dark:border-gray-700 dark:bg-gray-800',
  // Responsive
  'sm:px-6 sm:py-4',
  // Custom overrides
  className
)}>
```

## Naming Conventions

### Variables & Functions
- camelCase: `userName`, `handleClick`, `isLoading`

### Components
- PascalCase: `DocumentManager`, `TiptapEditor`, `Button`

### Types/Interfaces
- PascalCase: `EditorDocument`, `ToolbarProps`

### Constants
- SCREAMING_SNAKE_CASE: `API_URL`, `MAX_ITEMS`

### Boolean Variables
- Prefix with `is/has/should`: `isLoading`, `hasError`, `shouldRender`

### Event Handlers
- Prefix with `handle`: `handleClick`, `handleSubmit`, `handleClose`

## Comments & Documentation

- Use **JSDoc** for function documentation
- Comment **why**, not **what**
- Keep comments up-to-date

```tsx
/**
 * Auto-saves document content with debouncing
 * @param content - HTML content from editor
 * @param documentId - ID of document to save
 */
async function saveDocument(content: string, documentId: number) {
  // Debounce saves to avoid excessive writes to IndexedDB
  const timeoutId = setTimeout(() => {
    await updateDocument(documentId, { content });
  }, 500);
}
```

## Database Patterns

- Use **Dexie** for IndexedDB operations
- Encapsulate DB logic in **custom hooks**
- Handle async operations properly

```tsx
// ✅ Good - hook-based DB operations
const { documents, createDocument } = useEditorDB();

useEffect(() => {
  const init = async () => {
    await createDocument('New Document');
  };
  init();
}, []);
```

## State Management

### When to use what:
- **Local component state** (`useState`): Component-specific state
- **Zustand**: Global state, shared across multiple components
- **URL params**: Navigation, filtering, search
- **IndexedDB (Dexie)**: Persistent data, documents

## Error Handling

- Use **try-catch** for async operations
- Show user-friendly **error messages** via toasts
- **Log** errors for debugging (console.error)

```tsx
const handleDelete = async (id: number) => {
  try {
    await deleteDocument(id);
    success('Document deleted');
  } catch (error) {
    console.error('Failed to delete document:', error);
    error('Failed to delete document');
  }
};
```

## Accessibility (A11y)

- Use **semantic HTML** elements
- Add **aria-labels** to icon-only buttons
- Support **keyboard navigation**
- Proper **focus management** in modals

```tsx
// ✅ Good - accessible icon button
<button
  onClick={onClose}
  aria-label="Close dialog"
  className="p-2"
>
  <X className="w-5 h-5" />
</button>

// ✅ Good - semantic HTML
<article>
  <h2>Document Title</h2>
  <p>Content goes here...</p>
</article>
```

## Performance Considerations

- Use **useMemo** for expensive computations
- Use **useCallback** for event handlers passed to children
- **Debounce** expensive operations (search, auto-save)
- Avoid **anonymous functions** in JSX (use useCallback or define outside)

```tsx
// ✅ Good - memoized callback
const handleClick = useCallback(() => {
  doSomething(dependencies);
}, [dependencies]);

<button onClick={handleClick} />
```
