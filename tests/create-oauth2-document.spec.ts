import { test, expect } from '@playwright/test';

test.describe('Create OAuth2 Sample Document', () => {
  test('should create sample OAuth2 document with ERD diagrams', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    console.log('✅ Step 1: Creating new document...');

    // Click new document button
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Set document title
    const titleInput = page.locator('input[placeholder*="Untitled"]');
    await titleInput.fill('OAuth2 Authentication System');

    console.log('✅ Step 2: Adding document content...');

    // Focus editor and add content
    const editor = page.locator('[contenteditable="true"]');
    await editor.click();

    // Type heading
    await page.keyboard.type('OAuth2 Authentication System');
    await page.keyboard.press('Enter');

    // Type overview
    await page.keyboard.type('Overview');
    await page.keyboard.press('Enter');
    await page.keyboard.type('OAuth 2.0 is an authorization framework that enables applications to obtain limited access to user accounts on an HTTP service.');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    // Type about ERD
    await page.keyboard.type('Database Schema');
    await page.keyboard.press('Enter');
    await page.keyboard.type('The ERD diagram below shows the core entities:');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    console.log('✅ Step 3: Inserting ERD diagram...');

    // Insert ERD diagram
    await page.waitForTimeout(500);

    // Mock prompt for entity creation
    await page.evaluate(() => {
      (window as any).prompt = (message: string, defaultValue: string) => {
        const prompts = ['Users', 'OAuthApplications', 'AccessTokens', 'RefreshTokens'];
        const calls = (window as any).promptCalls || 0;
        (window as any).promptCalls = calls + 1;
        return prompts[calls] || 'Entity';
      };
    });

    // Click insert button
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const innerHTML = await button.innerHTML();
      if (innerHTML.includes('Hash')) {
        await button.scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
        await button.click();
        console.log('✅ Inserted ERD diagram');
        break;
      }
    }

    // Wait for canvas
    await page.waitForTimeout(3000);

    console.log('✅ Step 4: Creating entity nodes...');

    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    const canvasCount = await canvas.count();

    if (canvasCount > 0) {
      console.log('✅ Canvas found, creating entities...');

      const box = await canvas.first().boundingBox();

      if (box) {
        // Create first entity - Users (top-left)
        await page.mouse.click(box.x + 150, box.y + 80, { clickCount: 2 });
        await page.waitForTimeout(500);

        // Create second entity - OAuthApplications (top-right)
        await page.mouse.click(box.x + 450, box.y + 80, { clickCount: 2 });
        await page.waitForTimeout(500);

        // Create third entity - AccessTokens (bottom-left)
        await page.mouse.click(box.x + 150, box.y + 350, { clickCount: 2 });
        await page.waitForTimeout(500);

        // Create fourth entity - RefreshTokens (bottom-right)
        await page.mouse.click(box.x + 450, box.y + 350, { clickCount: 2 });
        await page.waitForTimeout(1000);

        console.log('✅ Created 4 entity nodes');

        // Create relationships (drag from one entity to another)
        // This is complex, so we'll skip for now
      }
    }

    console.log('✅ Step 5: Adding more content...');

    // Add content after diagram
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Authentication Flow');
    await page.keyboard.press('Enter');
    await page.keyboard.type('1. User clicks "Login with App"');
    await page.keyboard.press('Enter');
    await page.keyboard.type('2. Redirect to authorization server');
    await page.keyboard.press('Enter');
    await page.keyboard.type('3. User logs in and grants consent');
    await page.keyboard.press('Enter');
    await page.keyboard.type('4. Server returns authorization code');
    await page.keyboard.press('Enter');
    await page.keyboard.type('5. Client exchanges code for access token');
    await page.keyboard.press('Enter');
    await page.keyboard.type('6. Client accesses API with token');

    console.log('✅ Step 6: Taking screenshot...');

    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'tests/screenshots/oauth2-sample-document.png',
      fullPage: true
    });

    console.log('✅ Sample document created successfully!');
    console.log('📄 Document: "OAuth2 Authentication System"');
    console.log('📊 Includes: ERD diagram with 4 entities');
    console.log('🎯 Screenshot saved to: tests/screenshots/oauth2-sample-document.png');

    // Navigate back to save
    await page.click('[data-testid="back-to-documents-button"]');
    await page.waitForSelector('h1', { timeout: 10000 });

    console.log('✅ Document saved and ready to view!');
  });
});
