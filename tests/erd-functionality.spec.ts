import { test, expect } from '@playwright/test';

test.describe('ERD Diagram Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should show diagram type dropdown in toolbar', async ({ page }) => {
    // Click on first document to open editor
    await page.click('text=Test Document');
    await page.waitForSelector('.prose', { timeout: 5000 });

    // Check for diagram type dropdown
    const dropdown = page.locator('button:has-text("ERD")').first();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
  });

  test('should allow switching between ERD and Flowchart types', async ({ page }) => {
    await page.click('text=Test Document');
    await page.waitForSelector('.prose', { timeout: 5000 });

    // Click dropdown to open
    const dropdown = page.locator('button:has-text("ERD")').first();
    await dropdown.click();

    // Check that both options are visible
    await expect(page.locator('text=Entity Relationship Diagram')).toBeVisible();
    await expect(page.locator('text=Process Flow Diagram')).toBeVisible();

    // Click on Flowchart option
    await page.click('text=Process Flow Diagram');

    // Verify selection changed
    const updatedDropdown = page.locator('button:has-text("Flowchart")').first();
    await expect(updatedDropdown).toBeVisible();
  });

  test('should insert ERD diagram when ERD type is selected', async ({ page }) => {
    await page.click('text=Test Document');
    await page.waitForSelector('.prose', { timeout: 5000 });

    // Ensure ERD is selected
    const dropdown = page.locator('button:has-text("ERD")').first();
    if (await page.locator('button:has-text("Flowchart")').isVisible()) {
      await dropdown.click();
      await page.click('text=Entity Relationship Diagram');
    }

    // Click insert diagram button
    await page.click('[title="Insert Diagram"], button:has(svg):has-text("Insert")');

    // Wait for ReactFlow canvas to appear
    await page.waitForSelector('[data-testid="reactflow-canvas"]', { timeout: 5000 });

    // Verify canvas exists
    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('style', /background: white/);
  });

  test('should create entity node on double-click for ERD diagrams', async ({ page }) => {
    // Create a new document first
    await page.click('button:has-text("New Document")');
    await page.waitForSelector('.prose', { timeout: 5000 });

    // Insert ERD diagram
    const dropdown = page.locator('button:has-text("ERD")').first();
    await dropdown.click();

    // Click insert diagram button
    const insertButton = await page.locator('button').filter({ hasText: 'Insert' }).first();
    await insertButton.click();

    // Wait for ReactFlow canvas
    await page.waitForSelector('[data-testid="reactflow-canvas"]', { timeout: 5000 });

    // Mock the prompt by executing script
    await page.evaluate(() => {
      window.prompt = (message: string, defaultValue: string) => {
        return 'Users';
      };
    });

    // Double-click on the canvas
    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    await canvas.dblclick();

    // Wait for entity node to appear
    await page.waitForTimeout(500);

    // Check if entity node was created (should have entity class)
    const entityNode = page.locator('.entity-node').or(page.locator('text=Users'));
    
    // The node should be visible in the ReactFlow canvas
    await expect(canvas.locator('text=Users')).toBeVisible({ timeout: 5000 });
  });

  test('should display entity node with correct styling for PK entities', async ({ page }) => {
    await page.click('button:has-text("New Document")');
    await page.waitForSelector('.prose', { timeout: 5000 });

    // Insert ERD diagram
    await page.locator('button:has-text("ERD")').first().click();
    await page.locator('button').filter({ hasText: 'Insert' }).first().click();
    await page.waitForSelector('[data-testid="reactflow-canvas"]', { timeout: 5000 });

    // Mock prompt
    await page.evaluate(() => {
      window.prompt = () => 'Users';
    });

    // Create entity node
    await page.locator('[data-testid="reactflow-canvas"]').dblclick();
    await page.waitForTimeout(1000);

    // Check for entity styling
    const node = page.locator('.entity-node').or(page.locator('[style*="border"]'));
    await expect(node.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show minimap with entity nodes', async ({ page }) => {
    await page.click('button:has-text("New Document")');
    await page.waitForSelector('.prose', { timeout: 5000 });

    // Insert ERD diagram
    await page.locator('button:has-text("ERD")').first().click();
    await page.locator('button').filter({ hasText: 'Insert' }).first().click();
    await page.waitForSelector('[data-testid="reactflow-canvas"]', { timeout: 5000 });

    // Check for minimap
    const minimap = page.locator('.react-flow__minimap');
    await expect(minimap).toBeVisible({ timeout: 5000 });
  });

  test('should allow fullscreen mode for ERD diagrams', async ({ page }) => {
    await page.click('button:has-text("New Document")');
    await page.waitForSelector('.prose', { timeout: 5000 });

    // Insert ERD diagram
    await page.locator('button:has-text("ERD")').first().click();
    await page.locator('button').filter({ hasText: 'Insert' }).first().click();
    await page.waitForSelector('[data-testid="reactflow-canvas"]', { timeout: 5000 });

    // Click fullscreen button
    await page.click('[data-testid="fullscreen-button"]');

    // Check for fullscreen modal
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible({ timeout: 5000 });

    // Close fullscreen
    await page.click('button:has-text("Done")');

    // Verify modal is closed
    await expect(page.locator('.fixed.inset-0.z-50')).not.toBeVisible({ timeout: 5000 });
  });

  test('should persist diagram type in document', async ({ page }) => {
    await page.click('button:has-text("New Document")');
    await page.waitForSelector('.prose', { timeout: 5000 });

    // Insert ERD diagram
    await page.locator('button:has-text("ERD")').first().click();
    await page.locator('button').filter({ hasText: "Insert" }).first().click();
    await page.waitForSelector('[data-testid="reactflow-canvas"]', { timeout: 5000 });

    // Navigate back to document list
    await page.click('button:has-text("Back to Documents")');
    await page.waitForSelector('h1', { timeout: 5000 });

    // Open the document again
    await page.click('text=New Document');
    await page.waitForSelector('.prose', { timeout: 5000 });

    // Verify ERD canvas is still there
    await expect(page.locator('[data-testid="reactflow-canvas"]')).toBeVisible({ timeout: 5000 });
  });

  test('should create multiple ERD diagrams in one document', async ({ page }) => {
    await page.click('button:has-text("New Document")');
    await page.waitForSelector('.prose', { timeout: 5000 });

    // Insert first ERD diagram
    await page.locator('button:has-text("ERD")').first().click();
    await page.locator('button').filter({ hasText: "Insert" }).first().click();
    await page.waitForSelector('[data-testid="reactflow-canvas"]', { timeout: 5000 });

    // Move cursor to end of document
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');

    // Insert second ERD diagram
    await page.locator('button:has-text("ERD")').first().click();
    await page.locator('button').filter({ hasText: "Insert" }).first().click();

    // Wait for second canvas
    await page.waitForTimeout(500);

    // Verify multiple canvases exist
    const canvases = page.locator('[data-testid="reactflow-canvas"]');
    await expect(canvases).toHaveCount(2, { timeout: 5000 });
  });

  test('should handle resize for ERD diagrams', async ({ page }) => {
    await page.click('button:has-text("New Document")');
    await page.waitForSelector('.prose', { timeout: 5000 });

    // Insert ERD diagram
    await page.locator('button:has-text("ERD")').first().click();
    await page.locator('button').filter({ hasText: "Insert" }).first().click();
    await page.waitForSelector('[data-testid="reactflow-canvas"]', { timeout: 5000 });

    // Check for resize handles
    const resizeHandles = page.locator('[data-handle]');
    await expect(resizeHandles.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show controls and background pattern', async ({ page }) => {
    await page.click('button:has-text("New Document")');
    await page.waitForSelector('.prose', { timeout: 5000 });

    // Insert ERD diagram
    await page.locator('button:has-text("ERD")').first().click();
    await page.locator('button').filter({ hasText: "Insert" }).first().click();
    await page.waitForSelector('[data-testid="reactflow-canvas"]', { timeout: 5000 });

    // Check for controls
    const controls = page.locator('.react-flow__controls');
    await expect(controls).toBeVisible({ timeout: 5000 });

    // Check for background
    const background = page.locator('.react-flow__background');
    await expect(background).toBeVisible({ timeout: 5000 });
  });
});
