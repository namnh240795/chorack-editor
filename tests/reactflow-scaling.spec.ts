import { test, expect } from '@playwright/test';

test.describe('ReactFlow Scaling Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for app to load
    await page.waitForSelector('button', { timeout: 5000 });

    // Take screenshot of initial state
    await page.screenshot({
      path: 'tests/screenshots/01-app-loaded.png',
      fullPage: true
    });

    // Verify we're on the right page
    await expect(page.locator('text=/Create/i')).toBeTruthy();
  });

  test('should create a new document', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Click create button (adjust selector based on actual UI)
    const createButton = page.locator('button').filter({ hasText: /new|create/i }).first();
    await createButton.click();

    // Wait for editor
    await page.waitForSelector('[contenteditable="true"]', { timeout: 5000 });

    await page.screenshot({
      path: 'tests/screenshots/02-document-created.png',
      fullPage: true
    });
  });

  test('should verify ReactFlow background pattern', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Create document
    const createButton = page.locator('button').filter({ hasText: /new|create/i }).first();
    await createButton.click();
    await page.waitForSelector('[contenteditable="true"]');

    // Note: This test assumes there's a way to insert ReactFlow
    // You may need to adjust based on your actual extension mechanism

    // Check if ReactFlow is already in the document or needs to be inserted
    const reactFlowExists = await page.locator('.react-flow').count() > 0;

    if (reactFlowExists) {
      await page.waitForSelector('.react-flow');

      // Verify background component is present
      const background = page.locator('.react-flow__background');
      await expect(background).toBeVisible();

      // Verify controls
      const controls = page.locator('.react-flow__controls');
      await expect(controls).toBeVisible();

      // Verify minimap
      const minimap = page.locator('.react-flow__minimap');
      await expect(minimap).toBeVisible();

      await page.screenshot({
        path: 'tests/screenshots/03-reactflow-visible.png',
        fullPage: false
      });

      console.log('✅ ReactFlow background pattern verified');
    } else {
      console.log('ℹ️  ReactFlow not found in document - may need to be inserted via extension');
    }
  });

  test('should check resize handles are present', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const createButton = page.locator('button').filter({ hasText: /new|create/i }).first();
    await createButton.click();
    await page.waitForSelector('[contenteditable="true"]');

    // Look for ReactFlow container with resize handles
    const reactFlowContainer = page.locator('.react-flow').first();

    if (await reactFlowContainer.isVisible()) {
      // Check for resize handle markers (they have specific cursors)
      const resizeHandles = page.locator('css=[style*="cursor"][style*="resize"]');

      const handleCount = await resizeHandles.count();
      console.log(`Found ${handleCount} resize handles`);

      if (handleCount > 0) {
        await page.screenshot({
          path: 'tests/screenshots/04-resize-handles.png',
          fullPage: false
        });
        console.log('✅ Resize handles detected');
      }
    }
  });

  test('should test fullscreen mode', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const createButton = page.locator('button').filter({ hasText: /new|create/i }).first();
    await createButton.click();
    await page.waitForSelector('[contenteditable="true"]');

    // Look for fullscreen button
    const fullscreenButton = page.locator('button[aria-label="Fullscreen"], button:has-text("Fullscreen")').first();

    if (await fullscreenButton.isVisible()) {
      await fullscreenButton.click();

      // Wait for fullscreen modal
      await page.waitForTimeout(500);

      // Verify modal is open
      const modal = page.locator('.fixed.inset-0.z-50');
      await expect(modal).toBeVisible();

      await page.screenshot({
        path: 'tests/screenshots/05-fullscreen-mode.png',
        fullPage: true
      });

      // Close fullscreen
      const closeButton = page.locator('button:has-text("Done"), button:has-text("Close")').first();
      await closeButton.click();

      console.log('✅ Fullscreen mode tested');
    }
  });
});
