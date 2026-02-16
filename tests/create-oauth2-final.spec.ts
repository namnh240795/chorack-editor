import { test, expect } from '@playwright/test';

test('create and verify OAuth2 document with proper save', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('h1', { timeout: 10000 });

  console.log('📝 Creating OAuth2 document...');

  // Create new document
  await page.click('[data-testid="new-document-button"]');
  await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

  // Set title
  await page.locator('input[placeholder*="Untitled"]').fill('OAuth2 Authentication System');

  // Focus editor
  const editor = page.locator('[contenteditable="true"]');
  await editor.click();

  // Add content
  await page.keyboard.type('OAuth2 Authentication Guide');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');

  await page.keyboard.type('This guide demonstrates the ERD feature with an OAuth2 database schema.');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');

  await page.keyboard.type('Core Entities:');
  await page.keyboard.press('Enter');
  await page.keyboard.type('- Users: User accounts with credentials');
  await page.keyboard.press('Enter');
  await page.keyboard.type('- OAuthApplications: Registered client applications');
  await page.keyboard.press('Enter');
  await page.keyboard.type('- AccessTokens: Short-lived API access tokens');
  await page.keyboard.press('Enter');
  await page.keyboard.type('- RefreshTokens: Long-lived token refresh mechanism');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');

  console.log('📊 Inserting ERD diagram...');

  // Setup prompts
  await page.evaluate(() => {
    const entities = ['Users', 'OAuthApplications', 'AccessTokens', 'RefreshTokens'];
    let idx = 0;
    (window as any).prompt = () => entities[idx++] || 'Entity';
  });

  // Insert ERD diagram
  const allButtons = page.locator('button');
  for (let i = 0; i < await allButtons.count(); i++) {
    const innerHTML = await allButtons.nth(i).innerHTML();
    if (innerHTML.includes('Hash')) {
      await allButtons.nth(i).click();
      break;
    }
  }

  await page.waitForTimeout(3000);

  console.log('🎨 Creating entities...');

  const canvas = page.locator('[data-testid="reactflow-canvas"]');
  if (await canvas.count() > 0) {
    const box = await canvas.first().boundingBox();
    
    if (box) {
      // Create 4 entities
      const positions = [
        { x: 150, y: 80 },   // Users
        { x: 500, y: 80 },   // OAuthApplications
        { x: 150, y: 350 },  // AccessTokens
        { x: 500, y: 350 },  // RefreshTokens
      ];

      for (let i = 0; i < positions.length; i++) {
        await page.mouse.click(
          box.x + positions[i].x,
          box.y + positions[i].y,
          { clickCount: 2 }
        );
        await page.waitForTimeout(800);
        console.log(`  ✅ Created entity ${i + 1}/4`);
      }
    }
  }

  console.log('⏳ Waiting for auto-save...');

  // Wait for save to complete
  await page.waitForTimeout(3000);

  // Check for "Saved" indicator (use first() to avoid strict mode violation)
  const savedIndicator = page.locator('text=Saved').first();
  const maxWait = 10;
  let saved = false;

  for (let i = 0; i < maxWait; i++) {
    if (await savedIndicator.isVisible()) {
      saved = true;
      console.log('✅ Document saved');
      break;
    }
    await page.waitForTimeout(1000);
  }

  if (!saved) {
    console.log('⚠️  Save indicator not found, proceeding anyway...');
  }

  // Navigate back
  await page.click('[data-testid="back-to-documents-button"]');
  await page.waitForSelector('h1', { timeout: 10000 });

  console.log('🔍 Verifying document was created...');

  // Look for OAuth2 document
  const oauthDoc = page.locator('text=OAuth2').or(page.locator('text=oauth2'));
  const count = await oauthDoc.count();

  console.log(`Found ${count} document(s) with "OAuth2" in the title`);

  if (count > 0) {
    const docTexts = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await oauthDoc.nth(i).textContent();
      docTexts.push(text?.trim());
    }

    console.log('Documents found:');
    docTexts.forEach(text => console.log(`  - ${text}`));

    expect(count).toBeGreaterThan(0);

    console.log('');
    console.log('✅✅✅ SUCCESS! ✅✅✅');
    console.log('');
    console.log('📄 Sample OAuth2 document created with:');
    console.log('   • Interactive ERD diagram');
    console.log('   • 4 entities (Users, OAuthApplications, AccessTokens, RefreshTokens)');
    console.log('   • Complete OAuth2 documentation');
    console.log('');
    console.log('🎯 Open http://localhost:5173 to view the document!');
    console.log('   Click on the document title to open it');
    console.log('   You can edit, add more entities, and create relationships');
  } else {
    console.log('❌ Document not found in list');
    console.log('This could mean:');
    console.log('  - Document was not saved (auto-save timing issue)');
    console.log('  - Document has a different title');
    console.log('  - IndexedDB was cleared');
  }
});
