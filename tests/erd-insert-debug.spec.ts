import { test, expect } from '@playwright/test';

test.describe('ERD Insert Debug', () => {
  test('should insert ERD diagram with detailed logging', async ({ page }) => {
    // Capture console messages
    page.on('console', msg => {
      console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
    });

    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    console.log('✅ Homepage loaded');

    // Create new document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    console.log('✅ New document created');

    // Wait for editor to be ready
    await page.waitForTimeout(1000);

    // Check editor is focused
    const editor = page.locator('[contenteditable="true"]');
    await editor.click();

    console.log('✅ Editor focused');

    // Get all buttons and find the insert diagram button
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`Total buttons: ${buttonCount}`);

    // Log button details
    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const title = await button.getAttribute('title');
      const innerHTML = await button.innerHTML();
      const text = await button.textContent();

      if (title?.includes('Insert') || title?.includes('Diagram') || innerHTML.includes('Hash')) {
        console.log(`Button ${i}: title="${title}" text="${text}" hasHash=${innerHTML.includes('Hash')}`);
      }
    }

    // Find and click the insert diagram button
    let clickedButton = false;
    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const innerHTML = await button.innerHTML();
      const title = await button.getAttribute('title');

      if (innerHTML.includes('Hash') || title?.includes('Diagram')) {
        console.log(`Clicking button ${i}...`);

        // Ensure button is visible and clickable
        await button.scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);

        // Click the button
        await button.click();
        clickedButton = true;

        console.log('✅ Button clicked');

        // Wait for ReactFlow to render
        await page.waitForTimeout(3000);

        break;
      }
    }

    if (!clickedButton) {
      console.log('❌ No insert button found');
      await page.screenshot({ path: 'tests/screenshots/insert-debug-no-button.png', fullPage: true });
      test.skip();
      return;
    }

    // Check for ReactFlow canvas
    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    const canvasCount = await canvas.count();
    console.log(`Canvas count: ${canvasCount}`);

    if (canvasCount > 0) {
      console.log('✅ ReactFlow canvas found');

      // Check canvas properties
      const isVisible = await canvas.first().isVisible();
      const boundingBox = await canvas.first().boundingBox();

      console.log(`Canvas visible: ${isVisible}`);
      console.log(`Canvas dimensions: ${boundingBox?.width}x${boundingBox?.height}`);

      // Check for ReactFlow elements
      const background = page.locator('.react-flow__background');
      const bgCount = await background.count();
      console.log(`Background count: ${bgCount}`);

      const controls = page.locator('.react-flow__controls');
      const ctrlCount = await controls.count();
      console.log(`Controls count: ${ctrlCount}`);

      const minimap = page.locator('.react-flow__minimap');
      const mmCount = await minimap.count();
      console.log(`Minimap count: ${mmCount}`);

      await page.screenshot({ path: 'tests/screenshots/insert-debug-success.png', fullPage: false });
    } else {
      console.log('❌ No ReactFlow canvas found');

      // Check for any react-flow elements
      const reactFlowElements = page.locator('.react-flow');
      const rfCount = await reactFlowElements.count();
      console.log(`ReactFlow class count: ${rfCount}`);

      // Take screenshot of editor
      await page.screenshot({ path: 'tests/screenshots/insert-debug-failed.png', fullPage: true });

      // Get editor HTML
      const editorHTML = await editor.evaluate(el => el.innerHTML);
      console.log('Editor HTML length:', editorHTML.length);

      // Check for any data-diagram-type attributes
      const hasDiagramType = editorHTML.includes('data-diagram-type');
      const hasReactFlow = editorHTML.includes('react-flow');
      const hasFlowId = editorHTML.includes('data-flow-id');

      console.log(`Editor has data-diagram-type: ${hasDiagramType}`);
      console.log(`Editor has react-flow: ${hasReactFlow}`);
      console.log(`Editor has data-flow-id: ${hasFlowId}`);
    }
  });

  test('should check Tiptap editor state', async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
      }
    });

    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Check if editor is ready
    const editor = page.locator('[contenteditable="true"]');
    await editor.click();

    // Check Tiptap editor state
    const editorState = await editor.evaluate(el => {
      return {
        isActive: document.activeElement === el,
        innerHTML: el.innerHTML.substring(0, 500),
      };
    });

    console.log('Editor state:', editorState);

    // Try to execute the insertReactFlow command directly
    const commandResult = await page.evaluate(() => {
      // @ts-ignore - Accessing Tiptap editor
      const editor = window.editor;
      if (editor) {
        return {
          hasCommand: typeof editor.commands.insertReactFlow === 'function',
          canInsert: editor.can().insertReactFlow?.() ?? 'unknown',
        };
      }
      return { error: 'No editor found' };
    });

    console.log('Command check:', commandResult);
  });
});
