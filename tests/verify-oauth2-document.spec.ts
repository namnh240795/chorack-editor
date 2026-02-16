import { test, expect } from '@playwright/test';

test('verify OAuth2 document was created', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('h1', { timeout: 10000 });

  // Look for OAuth2 documents in the document list
  const oauthDocuments = page.locator('text=OAuth2');
  const count = await oauthDocuments.count();

  console.log(`Found ${count} document(s) with "OAuth2" in the title`);

  if (count > 0) {
    for (let i = 0; i < count; i++) {
      const text = await oauthDocuments.nth(i).textContent();
      console.log(`  - ${text}`);
    }
  }

  expect(count, 'Should have at least one OAuth2 document').toBeGreaterThan(0);

  console.log('');
  console.log('✅ Sample document created successfully!');
  console.log('🎯 Open http://localhost:5173 to view it in your browser');
});
