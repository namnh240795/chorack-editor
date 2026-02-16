# Suggested Commands - Chorack Editor

## Package Manager

**Always use `pnpm`** - This project uses pnpm as the package manager.

```bash
# Install dependencies
pnpm install

# Add a new dependency
pnpm add <package-name>

# Add a dev dependency
pnpm add -D <package-name>
```

## Development

```bash
# Start development server (http://localhost:5173)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Code Quality

```bash
# Run ESLint
pnpm lint

# Fix ESLint issues automatically (add --fix if supported)
pnpm lint
```

## Testing

```bash
# Run Playwright vision tests
pnpm test:vision
```

## System Commands (Darwin/macOS)

```bash
# List directory contents
ls -la

# Find files
find . -name "*.tsx"

# Search in files (case-insensitive)
grep -ri "pattern" src/

# Search in files (with file filter)
grep -r "pattern" src/**/*.tsx

# Show git status
git status

# Show git log
git log --oneline -10

# Create a new branch
git checkout -b feature/branch-name

# Git add and commit
git add .
git commit -m "commit message"
```

## When a Task is Completed

Before considering a coding task complete, run these checks:

1. **Type checking**: Ensure TypeScript compiles without errors
   ```bash
   pnpm build  # Includes tsc -b
   ```

2. **Linting**: Check for code style issues
   ```bash
   pnpm lint
   ```

3. **Manual testing**: Start dev server and test the changes
   ```bash
   pnpm dev
   ```

4. **Build verification**: Ensure production build works
   ```bash
   pnpm build
   pnpm preview
   ```

## Common Issues & Solutions

### Path Alias Issues
If `@/` imports don't resolve, ensure:
- `vite.config.ts` has `resolve.alias` configured
- `tsconfig.app.json` has `baseUrl` and `paths` configured

### Database Issues
IndexedDB is browser-specific. To reset:
```javascript
// In browser console
indexedDB.deleteDatabase('ChorackEditorDB')
```

Then refresh the page.

### Dark Mode
Dark mode preference is stored in `localStorage` under key `theme`.
