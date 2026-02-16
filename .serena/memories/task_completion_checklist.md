# Task Completion Checklist - Chorack Editor

## Before Marking a Task as Complete

### 1. Code Quality Checks

```bash
# Type checking (included in build)
pnpm build

# Linting
pnpm lint
```

- [ ] No TypeScript errors
- [ ] No ESLint warnings/errors
- [ ] All imports resolve correctly
- [ ] No console errors or warnings in browser

### 2. Functionality Testing

Start the dev server and manually test:
```bash
pnpm dev
```

- [ ] Feature works as expected
- [ ] Edge cases are handled (empty states, errors, etc.)
- [ ] User inputs are validated
- [ ] Async operations have loading/error states
- [ ] Toast notifications appear for user feedback

### 3. UI/UX Checks

- [ ] Component is responsive (mobile, tablet, desktop)
- [ ] Dark mode works correctly
- [ ] Hover/focus states are visible
- [ ] Transitions are smooth
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Loading states are shown during async operations

### 4. Browser Compatibility

Test in multiple browsers if possible:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

### 5. Code Review

- [ ] Code follows project conventions (see `coding_style.md`)
- [ ] No commented-out code left behind
- [ ] No `console.log` statements for debugging
- [ ] Proper error handling with try-catch
- [ ] Appropriate use of TypeScript types
- [ ] Components are properly typed with interfaces

### 6. Database & State

- [ ] IndexedDB operations are wrapped in try-catch
- [ ] State updates don't cause infinite loops
- [ ] Cleanup functions in useEffect (remove listeners, timeouts)
- [ ] No memory leaks (subscriptions, event listeners)

### 7. Files Modified

Verify changes:
```bash
git status
git diff
```

- [ ] Only intended files are modified
- [ ] No sensitive data (API keys, tokens) committed
- [ ] New files are added to git if needed

## Common Issues to Check

### Path Alias Issues
```bash
# If @/ imports fail, verify:
cat vite.config.ts  # Should have resolve.alias
cat tsconfig.app.json  # Should have baseUrl and paths
```

### TypeScript Errors
```bash
# Check for type errors
pnpm build
```

### Dark Mode Issues
- Check all components have `dark:` variants
- Verify text contrast in both modes
- Test borders and backgrounds

### Modal/Overlay Issues
- [ ] Escape key closes modal
- [ ] Click outside closes modal
- [ ] Body scroll is locked when modal is open
- [ ] Focus management (trap focus in modal)

### Form/Input Issues
- [ ] Labels are present (or aria-labels)
- [ ] Validation messages are clear
- [ ] Enter key submits forms appropriately
- [ ] Disabled states are visible

## After Completing a Task

### Update Documentation
- [ ] Update README if adding new features
- [ ] Update memory files if architecture changes
- [ ] Document any new APIs or data structures

### Commit Guidelines
```bash
git add .
git commit -m "feat: descriptive commit message"
```

Commit message prefixes:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring
- `style:` - Styling changes
- `docs:` - Documentation changes
- `test:` - Adding/updating tests
- `chore:` - Build/config changes

### Testing Commands Summary
```bash
# Full check before considering task complete
pnpm build    # Type check + production build
pnpm lint     # Code linting
pnpm dev      # Manual testing in browser
```

## Quick Reference

### Resetting Development Environment
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Reset IndexedDB (in browser console)
indexedDB.deleteDatabase('ChorackEditorDB')
```

### Useful Git Commands
```bash
# See what changed
git status
git diff

# Stage and commit
git add .
git commit -m "message"

# Discard local changes
git checkout -- .
```
