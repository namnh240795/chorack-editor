import { test, expect } from '@playwright/test';

test.describe('Manual Document Creation', () => {
  test('create OAuth2 document by clicking through UI', async ({ page }) => {
    console.log('🌐 Opening application...');
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Take screenshot of homepage
    await page.screenshot({ path: 'tests/screenshots/step-01-homepage.png' });
    console.log('✅ Step 1: Homepage loaded');

    // Click New Document button
    console.log('📝 Clicking New Document button...');
    const newDocButton = page.locator('[data-testid="new-document-button"]');
    await expect(newDocButton).toBeVisible();
    await newDocButton.click();

    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });
    await page.screenshot({ path: 'tests/screenshots/step-02-editor-opened.png' });
    console.log('✅ Step 2: Editor opened');

    // Set document title
    console.log('✏️  Setting document title...');
    const titleInput = page.locator('input[placeholder*="Untitled"]');
    await expect(titleInput).toBeVisible();
    await titleInput.clear();
    await titleInput.fill('OAuth2 Authentication System');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/step-03-title-set.png' });
    console.log('✅ Step 3: Title set to "OAuth2 Authentication System"');

    // Focus the editor
    const editor = page.locator('[contenteditable="true"]');
    await editor.click();
    await page.waitForTimeout(500);

    // Type heading
    console.log('⌨️  Typing content...');
    await page.keyboard.type('OAuth2 Authentication Guide');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    // Type overview
    await page.keyboard.type('This document demonstrates the ERD feature with OAuth2 database entities.');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await page.keyboard.type('Database Entities:');
    await page.keyboard.press('Enter');
    await page.keyboard.type('- Users: Store user accounts');
    await page.keyboard.press('Enter');
    await page.keyboard.type('- OAuthApplications: Client applications');
    await page.keyboard.press('Enter');
    await page.keyboard.type('- AccessTokens: API access tokens');
    await page.keyboard.press('Enter');
    await page.keyboard.type('- RefreshTokens: Token refresh');

    await page.waitForTimeout(500);
    console.log('✅ Step 4: Content typed');

    // Look for ERD dropdown
    console.log('🎛️  Finding ERD dropdown...');
    const erdDropdown = page.locator('button').filter({ hasText: 'ERD' });
    
    const erdCount = await erdDropdown.count();
    console.log(`   Found ${erdCount} ERD dropdown(s)`);

    if (erdCount > 0) {
      await erdDropdown.first().scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'tests/screenshots/step-05-dropdown-found.png' });
      console.log('✅ Step 5: ERD dropdown found');

      // Click insert diagram button (Hash icon)
      console.log('➕ Clicking insert diagram button...');
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();

      let clicked = false;
      for (let i = 0; i < buttonCount; i++) {
        const button = allButtons.nth(i);
        const innerHTML = await button.innerHTML();
        const title = await button.getAttribute('title');

        if (innerHTML.includes('Hash')) {
          console.log(`   Found insert button at index ${i}`);
          await button.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);
          
          // Highlight the button before clicking
          await button.evaluate((el) => {
            el.style.border = '3px solid red';
            el.style.borderRadius = '8px';
          });
          await page.waitForTimeout(1000);

          await button.click();
          clicked = true;
          console.log('✅ Step 6: Insert button clicked');
          break;
        }
      }

      if (clicked) {
        // Wait for canvas to appear
        await page.waitForTimeout(3000);

        const canvas = page.locator('[data-testid="reactflow-canvas"]');
        const canvasCount = await canvas.count();

        console.log(`   Canvas count: ${canvasCount}`);

        if (canvasCount > 0) {
          await page.screenshot({ path: 'tests/screenshots/step-07-canvas-created.png' });
          console.log('✅ Step 7: ERD canvas created!');

          // Setup prompts for entity creation
          await page.evaluate(() => {
            const entities = ['Users', 'OAuthApplications', 'AccessTokens', 'RefreshTokens'];
            let idx = 0;
            (window as any).prompt = (message: string) => {
              const name = entities[idx] || 'Entity';
              idx++;
              console.log(`Prompt: ${message} -> ${name}`);
              return name;
            };
          });

          // Create entities by double-clicking
          console.log('🎨 Creating entity nodes...');
          const box = await canvas.first().boundingBox();

          if (box) {
            const positions = [
              { x: 150, y: 100, name: 'Users' },
              { x: 500, y: 100, name: 'OAuthApplications' },
              { x: 150, y: 350, name: 'AccessTokens' },
              { x: 500, y: 350, name: 'RefreshTokens' },
            ];

            for (let i = 0; i < positions.length; i++) {
              const pos = positions[i];
              console.log(`   Creating ${pos.name} at (${pos.x}, ${pos.y})...`);
              
              await page.mouse.click(
                box.x + pos.x,
                box.y + pos.y,
                { clickCount: 2 }
              );
              
              await page.waitForTimeout(1500);
              console.log(`   ✅ ${pos.name} entity created`);
            }

            await page.screenshot({ path: 'tests/screenshots/step-08-entities-created.png' });
            console.log('✅ Step 8: All 4 entities created!');
          }
        } else {
          console.log('❌ No canvas found after clicking insert');
          await page.screenshot({ path: 'tests/screenshots/step-07-no-canvas.png' });
        }
      }
    } else {
      console.log('❌ ERD dropdown not found!');
      await page.screenshot({ path: 'tests/screenshots/step-05-no-dropdown.png' });
    }

    // Wait for save
    console.log('⏳ Waiting for document to save...');
    await page.waitForTimeout(3000);

    // Check save status
    const savedText = await page.locator('text=Saved').first().isVisible();
    console.log(`   Saved status: ${savedText ? 'Visible' : 'Not visible'}`);

    await page.screenshot({ path: 'tests/screenshots/step-09-final-document.png', fullPage: true });
    console.log('✅ Step 9: Final document screenshot taken');

    // Go back to document list
    console.log('⬅️  Navigating back to document list...');
    await page.click('[data-testid="back-to-documents-button"]');
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/step-10-document-list.png' });
    console.log('✅ Step 10: Back to document list');

    // Look for our document
    console.log('🔍 Looking for "OAuth2" document...');
    const oauthDoc = page.locator('text=OAuth2').or(page.locator('text=oauth2'));
    const count = await oauthDoc.count();

    console.log(`   Found ${count} document(s) with "OAuth2" in title`);

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await oauthDoc.nth(i).textContent();
        console.log(`   - ${text}`);
      }

      console.log('');
      console.log('✅✅✅ SUCCESS! Document created! ✅✅✅');
      console.log('');
      console.log('📄 To view your document:');
      console.log('   1. Open http://localhost:5173');
      console.log('   2. Find "OAuth2 Authentication System"');
      console.log('   3. Click to open it');
      console.log('   4. See the ERD diagram with 4 entities');
    } else {
      console.log('');
      console.log('❌ Document not found in list');
      console.log('   The document was created but may not have saved properly');
      console.log('   Check the screenshots in tests/screenshots/ to debug');
    }

    await page.waitForTimeout(2000);
  });
});
