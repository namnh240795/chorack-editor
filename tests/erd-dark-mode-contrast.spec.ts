import { test, expect } from '@playwright/test';

test.describe('ERD Editor - Dark Mode Contrast', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the ERD Editor
    await page.goto('http://localhost:5173/erd-editor');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('switch to dark mode and capture screenshots', async ({ page }) => {
    // Click the theme toggle button to switch to dark mode
    const themeToggle = page.locator('button:has([d*="M20.354"])'); // Moon icon
    await themeToggle.click();
    
    // Wait for theme change
    await page.waitForTimeout(500);
    
    // Capture full page screenshot in dark mode
    await page.screenshot({ 
      path: 'tests/screenshots/erd-dark-mode-full.png',
      fullPage: true 
    });
    
    console.log('✅ Dark mode screenshot saved: tests/screenshots/erd-dark-mode-full.png');
  });

  test('create entity in dark mode and check contrast', async ({ page }) => {
    // Switch to dark mode first
    const themeToggle = page.locator('button:has([d*="M20.354"])'); // Moon icon
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Click "Add Entity" button
    const addEntityButton = page.getByText('Add Entity').first();
    await addEntityButton.click();
    
    // Wait for modal to appear
    await page.waitForSelector('.fixed.inset-0.z-50', { state: 'visible' });
    
    // Fill in entity name
    const entityNameInput = page.locator('input[placeholder*="entity"]');
    await entityNameInput.fill('Users');
    
    // Add attributes
    const addAttributeButton = page.getByText('Add Attribute');
    await addAttributeButton.click();
    
    // Fill attribute details
    const attributeNameInputs = page.locator('input[placeholder*="attribute name"]');
    await attributeNameInputs.nth(0).fill('id');
    
    // Select type
    const typeSelect = page.locator('select').first();
    await typeSelect.selectOption('Number');
    
    // Check Primary Key
    const pkCheckbox = page.locator('input[type="checkbox"]').first();
    await pkCheckbox.check();
    
    // Submit the form
    const submitButton = page.getByText('Create Entity');
    await submitButton.click();
    
    // Wait for entity to be created
    await page.waitForTimeout(1000);
    
    // Take screenshot of the entity in dark mode
    const entityNode = page.locator('.entity-node').first();
    await entityNode.screenshot({ 
      path: 'tests/screenshots/entity-dark-mode.png' 
    });
    
    console.log('✅ Entity screenshot in dark mode saved');
    
    // Check for visibility of text
    const entityLabel = page.locator('.entity-node .text-base.font-bold').first();
    await expect(entityLabel).toBeVisible();
    
    // Get computed styles to check contrast
    const labelColor = await entityLabel.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Entity label color:', labelColor);
  });

  test('check all text elements contrast in dark mode', async ({ page }) => {
    // Switch to dark mode
    const themeToggle = page.locator('button:has([d*="M20.354"])');
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Create an entity first
    const addEntityButton = page.getByText('Add Entity').first();
    await addEntityButton.click();
    await page.waitForSelector('.fixed.inset-0.z-50', { state: 'visible' });
    
    const entityNameInput = page.locator('input[placeholder*="entity"]');
    await entityNameInput.fill('TestEntity');
    
    const addAttributeButton = page.getByText('Add Attribute');
    await addAttributeButton.click();
    
    const attributeNameInputs = page.locator('input[placeholder*="attribute name"]');
    await attributeNameInputs.nth(0).fill('username');
    
    const submitButton = page.getByText('Create Entity');
    await submitButton.click();
    
    await page.waitForTimeout(1000);
    
    // Check contrast of various text elements
    const entityNode = page.locator('.entity-node').first();
    
    // Get all text elements within the entity
    const textElements = await entityNode.locator('*').all();
    
    const contrastIssues: string[] = [];
    
    for (const element of textElements) {
      const text = await element.textContent();
      if (!text || text.trim().length === 0) continue;
      
      const isVisible = await element.isVisible();
      if (!isVisible) continue;
      
      const color = await element.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      
      const backgroundColor = await element.evaluate((el) => {
        const bg = window.getComputedStyle(el).backgroundColor;
        return bg;
      });
      
      console.log(`Text: "${text.trim()}" - Color: ${color}, BG: ${backgroundColor}`);
      
      // Check if color is too light for dark mode (rgb values should be low)
      const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // For dark mode, brightness should be < 128 (darker)
        if (brightness > 180) {
          contrastIssues.push(`"${text.trim()}" - Too bright (${brightness.toFixed(0)})`);
        }
      }
    }
    
    if (contrastIssues.length > 0) {
      console.log('⚠️ Contrast issues found:');
      contrastIssues.forEach(issue => console.log('  -', issue));
    } else {
      console.log('✅ No obvious contrast issues detected');
    }
    
    // Screenshot for manual review
    await page.screenshot({ 
      path: 'tests/screenshots/erd-dark-mode-contrast-check.png' 
    });
  });

  test('hover states in dark mode', async ({ page }) => {
    // Switch to dark mode
    const themeToggle = page.locator('button:has([d*="M20.354"])');
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Create entity
    const addEntityButton = page.getByText('Add Entity').first();
    await addEntityButton.click();
    await page.waitForSelector('.fixed.inset-0.z-50', { state: 'visible' });
    
    const entityNameInput = page.locator('input[placeholder*="entity"]');
    await entityNameInput.fill('Product');
    
    const addAttributeButton = page.getByText('Add Attribute');
    await addAttributeButton.click();
    
    const attributeNameInputs = page.locator('input[placeholder*="attribute name"]');
    await attributeNameInputs.nth(0).fill('name');
    
    const submitButton = page.getByText('Create Entity');
    await submitButton.click();
    
    await page.waitForTimeout(1000);
    
    // Hover over the entity
    const entityNode = page.locator('.entity-node').first();
    await entityNode.hover();
    await page.waitForTimeout(300);
    
    // Screenshot with hover state
    await page.screenshot({ 
      path: 'tests/screenshots/entity-dark-mode-hover.png' 
    });
    
    console.log('✅ Hover state screenshot saved');
    
    // Check if quick actions button is visible
    const quickActionsButton = entityNode.locator('button.absolute.top-3.right-3');
    await expect(quickActionsButton).toBeVisible();
    
    // Get button contrast
    const buttonColor = await quickActionsButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Quick actions button background:', buttonColor);
  });
});
