#!/bin/bash

echo "🎭 Playwright MCP Verification Script"
echo "===================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules/@playwright/mcp" ]; then
    echo "❌ @playwright/mcp not found in node_modules"
    echo "Run: pnpm add -D @playwright/mcp"
    exit 1
fi

echo "✅ @playwright/mcp installed"

# Check if config exists
if [ ! -f ".vscode/mcp.json" ]; then
    echo "❌ MCP config not found at .vscode/mcp.json"
    exit 1
fi

echo "✅ MCP config exists at .vscode/mcp.json"

# Check if playwright browsers are installed
if ! npx playwright --version > /dev/null 2>&1; then
    echo "⚠️  Playwright CLI not available"
    exit 1
fi

PLAYWRIGHT_VERSION=$(npx playwright --version)
echo "✅ Playwright installed: $PLAYWRIGHT_VERSION"

# Check if browsers are installed
if [ ! -d "$HOME/Library/Caches/ms-playwright" ] && [ ! -d "$HOME/.cache/ms-playwright" ]; then
    echo "⚠️  Playwright browsers may not be installed"
    echo "Run: npx playwright install chromium"
else
    echo "✅ Playwright browsers installed"
fi

echo ""
echo "🎉 All checks passed! Playwright MCP is ready to use."
echo ""
echo "Next steps:"
echo "1. Start dev server: pnpm dev"
echo "2. Use Playwright MCP tools to automate browser testing"
echo "3. See tests/playwright-mcp-test.md for usage examples"
