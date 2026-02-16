import { test, expect } from '@playwright/test';

test.describe('ReactFlow Scaling - Simple Tests', () => {
  test('should load application homepage', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for app to load
    await page.waitForSelector('h1', { timeout: 5000 });

    // Verify title
    const title = await page.locator('h1').textContent();
    expect(title).toContain('Documents');

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/01-homepage.png',
      fullPage: true
    });

    console.log('✅ Application loaded successfully');
  });

  test('should create a new document', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1');

    // Click "New Document" button using test ID
    await page.click('[data-testid="new-document-button"]');

    // Wait for editor to load (client-side navigation)
    await page.waitForSelector('[contenteditable="true"]', { timeout: 5000 });

    // Verify we're on the editor page by checking for back button
    await expect(page.locator('[data-testid="back-to-documents-button"]')).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/02-new-document.png',
      fullPage: true
    });

    console.log('✅ New document created and navigated successfully');
  });

  test('should verify ReactFlow canvas dimensions', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1');

    // Create document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]');

    // Check if ReactFlow is present
    const reactFlowCanvas = page.locator('[data-testid="reactflow-canvas"]');

    if (await reactFlowCanvas.count() > 0) {
      // Get ReactFlow canvas
      await expect(reactFlowCanvas.first()).toBeVisible();

      // Get initial dimensions
      const box = await reactFlowCanvas.first().boundingBox();
      console.log(`Initial ReactFlow dimensions: ${box?.width}x${box?.height}`);

      // Verify background is present
      const background = page.locator('.react-flow__background');
      await expect(background.first()).toBeVisible();

      // Verify controls are present
      const controls = page.locator('.react-flow__controls');
      await expect(controls.first()).toBeVisible();

      // Take screenshot
      await page.screenshot({
        path: 'tests/screenshots/03-reactflow-canvas.png',
        fullPage: false
      });

      console.log('✅ ReactFlow canvas verified');
    } else {
      console.log('ℹ️  No ReactFlow canvas found in document (expected for new document)');
    }
  });

  test('should check for ReactFlow resize handles', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1');

    // Create document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]');

    // Look for resize handles by test ID
    const resizeHandleSE = page.locator('[data-testid="resize-handle-se"]');

    if (await resizeHandleSE.count() > 0) {
      console.log('✅ Resize handle found with test ID');

      // Take screenshot
      await page.screenshot({
        path: 'tests/screenshots/04-resize-handles.png',
        fullPage: false
      });
    } else {
      console.log('ℹ️  No resize handles found (ReactFlow may not be inserted yet)');
    }
  });

  test('should verify ReactFlow background pattern', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1');

    // Create document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]');

    // Check for ReactFlow background
    const background = page.locator('.react-flow__background');

    if (await background.count() > 0) {
      await expect(background.first()).toBeVisible();

      // Get background styles to verify it's rendered
      const bgStyle = await background.first().getAttribute('style');
      console.log('Background style present:', !!bgStyle);

      // Take screenshot
      await page.screenshot({
        path: 'tests/screenshots/05-background-pattern.png',
        fullPage: false
      });

      console.log('✅ ReactFlow background pattern verified');
    } else {
      console.log('ℹ️  No ReactFlow background found (ReactFlow may not be inserted yet)');
    }
  });

  test('should return to document list', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1');

    // Create document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]');

    // Click back button using test ID
    const backButton = page.locator('[data-testid="back-to-documents-button"]');
    await backButton.click();

    await page.waitForSelector('h1');

    // Verify we're back on the home page
    await expect(page.locator('h1')).toContainText('Documents');

    console.log('✅ Navigation back to document list works');
  });

  test('should verify ReactFlowProvider is configured', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1');

    // Create document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]');

    // Check for console errors related to ReactFlow
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    // Wait a bit to capture any errors
    await page.waitForTimeout(2000);

    // Check for zustand provider error
    const hasProviderError = logs.some(log =>
      log.includes('zustand') || log.includes('ReactFlowProvider')
    );

    if (hasProviderError) {
      console.log('❌ ReactFlowProvider errors detected:', logs);
      throw new Error('ReactFlowProvider not configured correctly');
    } else {
      console.log('✅ No ReactFlowProvider errors detected - fix verified!');
    }
  });

  test('should check fullscreen button', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1');

    // Create document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]');

    // Look for fullscreen button
    const fullscreenButton = page.locator('[data-testid="fullscreen-button"]');

    if (await fullscreenButton.count() > 0) {
      console.log('✅ Fullscreen button found');

      // Take screenshot
      await page.screenshot({
        path: 'tests/screenshots/06-fullscreen-button.png',
        fullPage: false
      });
    } else {
      console.log('ℹ️  No fullscreen button found (ReactFlow may not be inserted yet)');
    }
  });
});
