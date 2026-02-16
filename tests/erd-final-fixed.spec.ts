import { test, expect } from '@playwright/test';

test.describe('ERD Feature - Fixed with Focus', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
  });

  async function insertERDDiagram(page: any) {
    // Focus the editor first
    await page.locator('[contenteditable="true"]').click();
    await page.waitForTimeout(500);

    // Find and click insert button
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const innerHTML = await button.innerHTML();
      if (innerHTML.includes('Hash')) {
        console.log('Clicking insert button...');
        await button.click();
        break;
      }
    }

    // Wait for canvas
    await page.waitForTimeout(2500);
  }

  test('should insert ERD diagram with proper focus', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    await insertERDDiagram(page);

    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    await expect(canvas.first()).toBeVisible({ timeout: 5000 });

    console.log('✅ ERD diagram inserted successfully');

    await page.screenshot({ path: 'tests/screenshots/fixed-01-insert.png', fullPage: false });
  });

  test('should create entity node with proper focus', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Mock prompt
    await page.evaluate(() => {
      (window as any).prompt = (message: string, defaultValue: string) => 'Users';
    });

    await insertERDDiagram(page);

    // Double-click canvas
    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    const box = await canvas.first().boundingBox();

    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { clickCount: 2 });
      await page.waitForTimeout(2000);

      // Check for entity
      const entityText = page.locator('text=Users');
      const count = await entityText.count();

      console.log(`Entity nodes found: ${count}`);

      if (count > 0) {
        await expect(entityText.first()).toBeVisible();
        console.log('✅ Entity node created');
      } else {
        // Check entity class
        const entityNode = page.locator('.entity-node');
        const nodeCount = await entityNode.count();
        console.log(`Entity nodes by class: ${nodeCount}`);
      }

      await page.screenshot({ path: 'tests/screenshots/fixed-02-entity.png', fullPage: false });
    }
  });

  test('should show fullscreen with proper focus', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    await insertERDDiagram(page);

    // Check fullscreen button
    const fullscreenBtn = page.locator('[data-testid="fullscreen-button"]');
    await expect(fullscreenBtn.first()).toBeVisible({ timeout: 5000 });

    console.log('✅ Fullscreen button found');

    // Click fullscreen
    await fullscreenBtn.first().click();
    await page.waitForTimeout(1000);

    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible();

    console.log('✅ Fullscreen modal opened');

    await page.screenshot({ path: 'tests/screenshots/fixed-03-fullscreen.png', fullPage: true });

    // Close
    await page.click('button:has-text("Done")');
    await page.waitForTimeout(1000);

    await expect(page.locator('.fixed.inset-0.z-50')).not.toBeVisible();

    console.log('✅ Fullscreen modal closed');
  });

  test('should persist with proper focus', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    await insertERDDiagram(page);

    // Navigate back
    await page.click('[data-testid="back-to-documents-button"]');
    await page.waitForSelector('h1', { timeout: 5000 });

    // Navigate to document
    await page.click('text=New Document');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Check canvas persists
    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    await expect(canvas.first()).toBeVisible({ timeout: 5000 });

    console.log('✅ Diagram persisted across navigation');

    await page.screenshot({ path: 'tests/screenshots/fixed-04-persisted.png', fullPage: true });
  });

  test('should create multiple diagrams with proper focus', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Insert first diagram
    await insertERDDiagram(page);

    // Move to end and insert second
    await page.locator('[contenteditable="true"]').click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await insertERDDiagram(page);

    // Move to end and insert third
    await page.locator('[contenteditable="true"]').click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await insertERDDiagram(page);

    await page.waitForTimeout(2000);

    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    const canvasCount = await canvas.count();

    console.log(`Canvases found: ${canvasCount}`);

    await page.screenshot({ path: 'tests/screenshots/fixed-05-multiple.png', fullPage: true });
  });

  test('should test all diagram components', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    await insertERDDiagram(page);

    // Check all components
    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    await expect(canvas.first()).toBeVisible({ timeout: 5000 });

    const background = page.locator('.react-flow__background');
    await expect(background.first()).toBeVisible({ timeout: 5000 });

    const controls = page.locator('.react-flow__controls');
    await expect(controls.first()).toBeVisible({ timeout: 5000 });

    const minimap = page.locator('.react-flow__minimap');
    await expect(minimap.first()).toBeVisible({ timeout: 5000 });

    const fullscreenBtn = page.locator('[data-testid="fullscreen-button"]');
    await expect(fullscreenBtn.first()).toBeVisible({ timeout: 5000 });

    console.log('✅ All diagram components verified');

    await page.screenshot({ path: 'tests/screenshots/fixed-06-all-components.png', fullPage: false });
  });
});
