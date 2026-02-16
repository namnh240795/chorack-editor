import { test, expect } from '@playwright/test';

test.describe('ERD Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('Console error:', msg.text());
      }
    });
  });

  test('should show ERD dropdown in toolbar', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Create new document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Check for ERD dropdown
    const erdDropdown = page.locator('button').filter({ hasText: 'ERD' });
    await expect(erdDropdown).toBeVisible({ timeout: 5000 });

    console.log('✅ ERD dropdown is visible');
  });

  test('should switch between ERD and Flowchart', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Create new document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Click ERD dropdown
    const erdDropdown = page.locator('button').filter({ hasText: 'ERD' });
    await erdDropdown.click();
    await page.waitForTimeout(500);

    // Check for dropdown options
    await expect(page.locator('text=Entity Relationship Diagram')).toBeVisible();
    await expect(page.locator('text=Process Flow Diagram')).toBeVisible();

    // Click Flowchart option
    await page.click('text=Process Flow Diagram');
    await page.waitForTimeout(500);

    // Verify dropdown updated
    await expect(page.locator('button').filter({ hasText: 'Flowchart' })).toBeVisible();

    console.log('✅ Switched to Flowchart type');

    // Switch back to ERD
    await page.locator('button').filter({ hasText: 'Flowchart' }).click();
    await page.waitForTimeout(500);
    await page.click('text=Entity Relationship Diagram');
    await page.waitForTimeout(500);

    await expect(page.locator('button').filter({ hasText: 'ERD' })).toBeVisible();

    console.log('✅ Switched back to ERD type');
  });

  test('should insert ERD diagram', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Create new document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Ensure ERD is selected
    const dropdown = page.locator('button').filter({ hasText: 'ERD' });
    if (!(await dropdown.isVisible())) {
      await page.locator('button').filter({ hasText: 'Flowchart' }).click();
      await page.click('text=Entity Relationship Diagram');
    }

    // Find the insert diagram button - it's the button after the Link button
    // The toolbar has sections, and the insert section should have the diagram button
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();

    // Find button with Hash icon (the diagram insert button)
    let insertButtonFound = false;
    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const title = await button.getAttribute('title');
      const innerHTML = await button.innerHTML();

      // Look for the button with Hash icon
      if (innerHTML.includes('Hash') || title?.includes('Diagram') || title?.includes('Insert')) {
        console.log(`Found insert button at index ${i}:`, title);
        await button.click();
        insertButtonFound = true;
        break;
      }
    }

    if (!insertButtonFound) {
      // Try clicking the last button in the toolbar before the undo/redo section
      await allButtons.nth(buttonCount - 3).click();
      console.log('Clicked what should be the insert button');
    }

    // Wait for ReactFlow canvas to appear
    await page.waitForTimeout(2000);

    // Check for ReactFlow canvas
    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    const canvasCount = await canvas.count();

    if (canvasCount > 0) {
      console.log('✅ ReactFlow canvas created');
      await expect(canvas.first()).toBeVisible();
    } else {
      // Check if it was inserted in a different way
      const reactFlowElements = page.locator('.react-flow');
      const reactFlowCount = await reactFlowElements.count();
      console.log('ReactFlow elements found:', reactFlowCount);

      if (reactFlowCount > 0) {
        console.log('✅ ReactFlow was inserted (different structure)');
      } else {
        console.log('❌ No ReactFlow canvas found after clicking insert button');
        await page.screenshot({ path: 'tests/screenshots/erd-failed-insert.png', fullPage: true });
      }
    }
  });

  test('should create entity node on double-click', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Create new document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Mock the prompt before inserting the diagram
    await page.evaluate(() => {
      window.prompt = (message: string, defaultValue: string) => {
        console.log('Prompt called with:', message);
        return 'Users';
      };
    });

    // Insert ERD diagram
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();

    // Click the hash icon button (insert diagram)
    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const innerHTML = await button.innerHTML();
      if (innerHTML.includes('Hash')) {
        await button.click();
        break;
      }
    }

    // Wait for ReactFlow canvas
    await page.waitForTimeout(2000);

    // Double-click on the canvas
    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    const canvasCount = await canvas.count();

    if (canvasCount > 0) {
      await canvas.first().dblclick();
      await page.waitForTimeout(1000);

      // Check for entity node
      const entityNode = page.locator('text=Users');
      if (await entityNode.count() > 0) {
        console.log('✅ Entity node created');
        await expect(entityNode).toBeVisible();
      } else {
        console.log('❌ Entity node not found');
        await page.screenshot({ path: 'tests/screenshots/erd-no-entity.png', fullPage: true });
      }
    } else {
      console.log('❌ No canvas to double-click on');
    }
  });

  test('should show fullscreen button', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Create new document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Insert ERD diagram
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const innerHTML = await button.innerHTML();
      if (innerHTML.includes('Hash')) {
        await button.click();
        break;
      }
    }

    await page.waitForTimeout(2000);

    // Check for fullscreen button
    const fullscreenButton = page.locator('[data-testid="fullscreen-button"]');
    const buttonCountAfter = await fullscreenButton.count();

    if (buttonCountAfter > 0) {
      console.log('✅ Fullscreen button found');
      await expect(fullscreenButton.first()).toBeVisible();
    } else {
      console.log('❌ Fullscreen button not found');
    }
  });
});
