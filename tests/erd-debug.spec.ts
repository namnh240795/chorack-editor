import { test, expect } from '@playwright/test';

test.describe('ERD Debug Tests', () => {
  test('should load homepage and check for errors', async ({ page }) => {
    // Capture console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('Console error:', msg.text());
      }
    });

    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check for any console errors
    if (errors.length > 0) {
      console.log('Found console errors:', errors);
    }

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/debug-homepage.png', fullPage: true });
  });

  test('should create new document and check toolbar', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Create new document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Take screenshot of toolbar
    await page.screenshot({ path: 'tests/screenshots/debug-toolbar.png', fullPage: true });

    // Check for any element with "ERD" text
    const erdElements = await page.locator('text=ERD').count();
    console.log('Found ERD elements:', erdElements);

    // Log all buttons in the toolbar
    const buttons = await page.locator('button').allTextContents();
    console.log('Toolbar buttons:', buttons);
  });

  test('should check DOM structure', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Create new document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Check toolbar structure
    const toolbarExists = await page.locator('.border-b').count();
    console.log('Toolbar elements with border-b:', toolbarExists);

    // Check for toolbar buttons
    const allButtons = await page.locator('button').count();
    console.log('Total buttons on page:', allButtons);

    // Get first 10 button texts
    for (let i = 0; i < Math.min(10, allButtons); i++) {
      const button = page.locator('button').nth(i);
      const text = await button.textContent();
      const title = await button.getAttribute('title');
      console.log(`Button ${i}: text="${text?.trim()}" title="${title}"`);
    }
  });

  test('should insert ERD diagram', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Create new document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Try to find and click the diagram insert button
    const hashIconButtons = await page.locator('button svg').filter({ hasText: '' }).all();
    console.log('SVG buttons found:', hashIconButtons.length);

    // Look for button with hash/title="Insert Diagram"
    const insertButton = page.locator('button').filter({ hasText: 'Insert' }).or(
      page.locator('[title*="Diagram"]')
    ).or(
      page.locator('[title*="Hash"]')
    ).or(
      page.locator('button').filter({ has: page.locator('svg') })
    );

    const count = await insertButton.count();
    console.log('Potential insert buttons found:', count);

    // Click the insert button (last one in toolbar typically)
    if (count > 0) {
      await insertButton.last().click();
      await page.waitForTimeout(2000);

      // Check if ReactFlow canvas was created
      const canvas = page.locator('[data-testid="reactflow-canvas"]');
      const canvasCount = await canvas.count();
      console.log('ReactFlow canvases found:', canvasCount);

      await page.screenshot({ path: 'tests/screenshots/debug-after-insert.png', fullPage: true });
    } else {
      console.log('No insert button found');
      await page.screenshot({ path: 'tests/screenshots/debug-no-insert.png', fullPage: true });
    }
  });
});
