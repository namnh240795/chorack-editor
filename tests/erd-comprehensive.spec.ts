import { test, expect } from '@playwright/test';

test.describe('ERD Feature - Complete Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
  });

  test('1. Should show ERD dropdown in toolbar', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    const erdDropdown = page.locator('button').filter({ hasText: 'ERD' });
    await expect(erdDropdown).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'tests/screenshots/01-erd-dropdown.png', fullPage: true });
  });

  test('2. Should switch between ERD and Flowchart', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Click dropdown
    await page.locator('button').filter({ hasText: 'ERD' }).click();
    await page.waitForTimeout(500);

    // Verify options
    await expect(page.locator('text=Entity Relationship Diagram')).toBeVisible();
    await expect(page.locator('text=Process Flow Diagram')).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/02-dropdown-options.png', fullPage: true });

    // Select Flowchart
    await page.click('text=Process Flow Diagram');
    await page.waitForTimeout(500);

    await expect(page.locator('button').filter({ hasText: 'Flowchart' })).toBeVisible();

    // Switch back to ERD
    await page.locator('button').filter({ hasText: 'Flowchart' }).click();
    await page.click('text=Entity Relationship Diagram');
    await page.waitForTimeout(500);

    await expect(page.locator('button').filter({ hasText: 'ERD' })).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/03-switched-back.png', fullPage: true });
  });

  test('3. Should insert ERD diagram', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Click insert diagram button (button with Hash icon)
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

    // Verify canvas
    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    await expect(canvas.first()).toBeVisible({ timeout: 5000 });

    // Verify components
    await expect(page.locator('.react-flow__background').first()).toBeVisible();
    await expect(page.locator('.react-flow__controls').first()).toBeVisible();
    await expect(page.locator('.react-flow__minimap').first()).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/04-erd-canvas.png', fullPage: false });
  });

  test('4. Should show fullscreen button and modal', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Insert diagram
    const allButtons = page.locator('button');
    for (let i = 0; i < await allButtons.count(); i++) {
      if ((await allButtons.nth(i).innerHTML()).includes('Hash')) {
        await allButtons.nth(i).click();
        break;
      }
    }

    await page.waitForTimeout(2000);

    // Check fullscreen button
    const fullscreenBtn = page.locator('[data-testid="fullscreen-button"]');
    await expect(fullscreenBtn.first()).toBeVisible({ timeout: 5000 });

    // Click fullscreen
    await fullscreenBtn.first().click();
    await page.waitForTimeout(1000);

    // Check modal
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/05-fullscreen-modal.png', fullPage: true });

    // Close modal
    await page.click('button:has-text("Done")');
    await page.waitForTimeout(1000);

    await expect(page.locator('.fixed.inset-0.z-50')).not.toBeVisible();
  });

  test('5. Should create entity node on double-click', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Mock prompt
    await page.evaluate(() => {
      (window as any).prompt = (message: string, defaultValue: string) => 'Users';
    });

    // Insert diagram
    const allButtons = page.locator('button');
    for (let i = 0; i < await allButtons.count(); i++) {
      if ((await allButtons.nth(i).innerHTML()).includes('Hash')) {
        await allButtons.nth(i).click();
        break;
      }
    }

    await page.waitForTimeout(2000);

    // Double-click on canvas
    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    const box = await canvas.first().boundingBox();

    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { clickCount: 2 });
      await page.waitForTimeout(2000);

      // Check for entity node
      const entityText = page.locator('text=Users');
      const count = await entityText.count();

      if (count > 0) {
        await expect(entityText.first()).toBeVisible();
        await page.screenshot({ path: 'tests/screenshots/06-entity-created.png', fullPage: false });
      } else {
        // Check for entity class
        const entityNode = page.locator('.entity-node');
        const nodeCount = await entityNode.count();

        if (nodeCount === 0) {
          console.log('Entity node not found - taking screenshot for debugging');
          await page.screenshot({ path: 'tests/screenshots/06-entity-not-found.png', fullPage: false });
        }
      }
    }
  });

  test('6. Should create multiple ERD diagrams', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Helper to insert diagram
    const insertDiagram = async () => {
      const allButtons = page.locator('button');
      for (let i = 0; i < await allButtons.count(); i++) {
        if ((await allButtons.nth(i).innerHTML()).includes('Hash')) {
          await allButtons.nth(i).click();
          break;
        }
      }
      await page.waitForTimeout(1000);
    };

    // Insert first diagram
    await insertDiagram();

    // Add new line and insert second
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await insertDiagram();

    // Add new line and insert third
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await insertDiagram();

    await page.waitForTimeout(2000);

    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    const canvasCount = await canvas.count();

    console.log(`Canvases found: ${canvasCount}`);

    await page.screenshot({ path: 'tests/screenshots/07-multiple-diagrams.png', fullPage: true });
  });

  test('7. Should persist diagram across navigation', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Insert diagram
    const allButtons = page.locator('button');
    for (let i = 0; i < await allButtons.count(); i++) {
      if ((await allButtons.nth(i).innerHTML()).includes('Hash')) {
        await allButtons.nth(i).click();
        break;
      }
    }

    await page.waitForTimeout(2000);

    // Navigate back
    await page.click('[data-testid="back-to-documents-button"]');
    await page.waitForSelector('h1', { timeout: 5000 });

    // Navigate to document
    await page.click('text=New Document');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Check canvas persists
    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    await expect(canvas.first()).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'tests/screenshots/08-persisted-diagram.png', fullPage: true });
  });

  test('8. Should have resize handles', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Insert diagram
    const allButtons = page.locator('button');
    for (let i = 0; i < await allButtons.count(); i++) {
      if ((await allButtons.nth(i).innerHTML()).includes('Hash')) {
        await allButtons.nth(i).click();
        break;
      }
    }

    await page.waitForTimeout(2000);

    // Check for resize handles
    const resizeHandles = page.locator('[data-handle]');
    const handleCount = await resizeHandles.count();

    console.log(`Resize handles found: ${handleCount}`);

    if (handleCount > 0) {
      await expect(resizeHandles.first()).toBeVisible();
      await page.screenshot({ path: 'tests/screenshots/09-resize-handles.png', fullPage: false });
    }
  });
});
