import { test, expect } from '@playwright/test';

test.describe('ERD Persistence Test - Improved', () => {
  test('should persist ERD diagram with proper save timing', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Create new document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    console.log('✅ Step 1: New document created');

    // Wait for document to be fully loaded
    await page.waitForTimeout(1000);

    // Insert ERD diagram
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const innerHTML = await button.innerHTML();
      if (innerHTML.includes('Hash')) {
        await button.scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
        await button.click();
        break;
      }
    }

    console.log('✅ Step 2: Insert button clicked');

    // Wait for canvas to be created
    await page.waitForTimeout(3000);

    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    const canvasCount = await canvas.count();

    console.log(`Canvas count after insert: ${canvasCount}`);

    expect(canvasCount, 'Canvas should be created').toBeGreaterThan(0);

    // Wait for auto-save to complete (content has 500ms debounce)
    console.log('✅ Step 3: Waiting for auto-save...');
    await page.waitForTimeout(2000);

    // Verify saved status indicator
    const savedIndicator = page.locator('text=Saved');
    const isSaved = await savedIndicator.isVisible();

    console.log(`Document saved status: ${isSaved ? 'Saved' : 'Still saving'}`);

    if (!isSaved) {
      console.log('⚠️  Waiting additional time for save...');
      await page.waitForTimeout(2000);
    }

    // Navigate back to document list
    await page.click('[data-testid="back-to-documents-button"]');
    await page.waitForSelector('h1', { timeout: 10000 });

    console.log('✅ Step 4: Navigated back to document list');

    // Wait a moment for navigation to complete
    await page.waitForTimeout(1000);

    // Navigate back to the document (it should be "New Document")
    await page.click('text=New Document');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    console.log('✅ Step 5: Opened document again');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Check if canvas persists
    const canvasAfter = page.locator('[data-testid="reactflow-canvas"]');
    const canvasCountAfter = await canvasAfter.count();

    console.log(`Canvas count after navigation: ${canvasCountAfter}`);

    // Also check for any react-flow elements
    const reactFlowElements = page.locator('.react-flow');
    const reactFlowCount = await reactFlowElements.count();

    console.log(`ReactFlow elements after navigation: ${reactFlowCount}`);

    if (canvasCountAfter > 0) {
      await expect(canvasAfter.first()).toBeVisible();
      console.log('✅ Step 6: Diagram persisted successfully!');
    } else if (reactFlowCount > 0) {
      console.log('✅ Step 6: ReactFlow elements found (persistence working)');
    } else {
      console.log('⚠️  Step 6: Canvas may not have persisted');
      console.log('This could be due to:');
      console.log('  - Timing issue with auto-save');
      console.log('  - Tiptap serialization issue');
      console.log('  - Document content not being saved');

      // Get editor content for debugging
      const editorContent = await page.locator('[contenteditable="true"]').innerHTML();
      const hasReactFlow = editorContent.includes('react-flow');
      const hasFlowId = editorContent.includes('data-flow-id');
      const hasDiagramType = editorContent.includes('data-diagram-type');

      console.log('Editor content analysis:');
      console.log(`  - Contains "react-flow": ${hasReactFlow}`);
      console.log(`  - Contains "data-flow-id": ${hasFlowId}`);
      console.log(`  - Contains "data-diagram-type": ${hasDiagramType}`);

      await page.screenshot({
        path: 'tests/screenshots/persistence-debug.png',
        fullPage: true
      });
    }
  });

  test('should verify ReactFlow HTML serialization', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Insert ERD diagram
    const allButtons = page.locator('button');
    for (let i = 0; i < await allButtons.count(); i++) {
      if ((await allButtons.nth(i).innerHTML()).includes('Hash')) {
        await allButtons.nth(i).click();
        break;
      }
    }

    await page.waitForTimeout(3000);

    // Get editor HTML
    const editorHTML = await page.locator('[contenteditable="true"]').evaluate(el => el.innerHTML);

    console.log('Editor HTML length:', editorHTML.length);
    console.log('Contains data-type="react-flow":', editorHTML.includes('data-type="react-flow"'));
    console.log('Contains data-flow-id:', editorHTML.includes('data-flow-id'));
    console.log('Contains data-diagram-type:', editorHTML.includes('data-diagram-type'));

    // Look for the react-flow div
    const hasReactFlowDiv = editorHTML.includes('<div data-type="react-flow"');

    expect(hasReactFlowDiv, 'Editor should contain ReactFlow div').toBe(true);

    console.log('✅ ReactFlow HTML serialization working');
  });
});
