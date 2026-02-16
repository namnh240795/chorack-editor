import { test, expect } from '@playwright/test';

test.describe('Enhanced OAuth2 Document', () => {
  test('should create comprehensive OAuth2 document with detailed ERD', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1', { timeout: 10000 });

    console.log('📝 Creating comprehensive OAuth2 document...');

    // Create new document
    await page.click('[data-testid="new-document-button"]');
    await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

    // Set title
    await page.locator('input[placeholder*="Untitled"]').fill('OAuth2 Authentication Guide');

    // Focus editor
    const editor = page.locator('[contenteditable="true"]');
    await editor.click();

    // Add comprehensive content
    await page.keyboard.type('OAuth2 Authentication Guide');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await page.keyboard.type('Overview');
    await page.keyboard.press('Enter');
    await page.keyboard.type('OAuth 2.0 is the industry-standard protocol for authorization. It enables applications to obtain limited access to user accounts on an HTTP service.');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await page.keyboard.type('Core Components:');
    await page.keyboard.press('Enter');
    await page.keyboard.type('- Users: System users with credentials');
    await page.keyboard.press('Enter');
    await page.keyboard.type('- OAuth Applications: Registered client apps');
    await page.keyboard.press('Enter');
    await page.keyboard.type('- Access Tokens: Short-lived API access tokens');
    await page.keyboard.press('Enter');
    await page.keyboard.type('- Refresh Tokens: Long-lived token refresh mechanism');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await page.keyboard.type('Database Schema (ERD)');
    await page.keyboard.press('Enter');
    await page.keyboard.type('The diagram below shows the relationships between core entities:');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    console.log('📊 Inserting ERD diagram...');

    // Setup mock prompts
    await page.evaluate(() => {
      const prompts = [
        'Users',
        'OAuthApplications', 
        'AccessTokens',
        'RefreshTokens'
      ];
      let callCount = 0;
      (window as any).prompt = (msg: string) => {
        const result = prompts[callCount] || 'Entity';
        callCount++;
        console.log(`Prompt called: ${msg} -> Returning: ${result}`);
        return result;
      };
      (window as any).promptCalls = 0;
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

    console.log('🎨 Creating entity nodes...');

    const canvas = page.locator('[data-testid="reactflow-canvas"]');
    if (await canvas.count() > 0) {
      const box = await canvas.first().boundingBox();
      
      if (box) {
        // Users entity (top-left)
        await page.mouse.click(box.x + 150, box.y + 80, { clickCount: 2 });
        await page.waitForTimeout(800);
        console.log('✅ Created Users entity');

        // OAuthApplications entity (top-right)
        await page.mouse.click(box.x + 500, box.y + 80, { clickCount: 2 });
        await page.waitForTimeout(800);
        console.log('✅ Created OAuthApplications entity');

        // AccessTokens entity (bottom-left)
        await page.mouse.click(box.x + 150, box.y + 350, { clickCount: 2 });
        await page.waitForTimeout(800);
        console.log('✅ Created AccessTokens entity');

        // RefreshTokens entity (bottom-right)
        await page.mouse.click(box.x + 500, box.y + 350, { clickCount: 2 });
        await page.waitForTimeout(800);
        console.log('✅ Created RefreshTokens entity');
      }
    }

    console.log('📝 Adding authentication flow content...');

    // Add more content
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await page.keyboard.type('Authentication Flow:');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Step 1: User clicks "Sign in with [App]"');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Step 2: Browser redirects to authorization server');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Step 3: User logs in and grants permissions');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Step 4: Server generates authorization code');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Step 5: Client exchanges code for access token');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Step 6: Client uses access token to call API');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await page.keyboard.type('Security Best Practices:');
    await page.keyboard.press('Enter');
    await page.keyboard.type('• Always use HTTPS (TLS 1.2+)');
    await page.keyboard.press('Enter');
    await page.keyboard.type('• Hash secrets with bcrypt or argon2');
    await page.keyboard.press('Enter');
    await page.keyboard.type('• Use short-lived access tokens (15-30 min)');
    await page.keyboard.press('Enter');
    await page.keyboard.type('• Implement refresh token rotation');
    await page.keyboard.press('Enter');
    await page.keyboard.type('• Validate all tokens on every request');
    await page.keyboard.press('Enter');
    await page.keyboard.type('• Log all authentication events');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await page.keyboard.type('Token Types:');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Access Token: Used for API calls, expires in 15-30 minutes');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Refresh Token: Used to get new access tokens, expires in 30 days');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Authorization Code: Short-lived code exchanged for tokens');

    console.log('💾 Saving document...');

    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/oauth2-complete-guide.png',
      fullPage: true
    });

    // Go back to save
    await page.click('[data-testid="back-to-documents-button"]');
    await page.waitForSelector('h1', { timeout: 10000 });

    console.log('✅ Sample OAuth2 document created successfully!');
    console.log('');
    console.log('📄 Document: "OAuth2 Authentication Guide"');
    console.log('📊 Contents:');
    console.log('   • Overview of OAuth2');
    console.log('   • Core components list');
    console.log('   • Interactive ERD diagram with 4 entities');
    console.log('   • Step-by-step authentication flow');
    console.log('   • Security best practices');
    console.log('   • Token types explanation');
    console.log('');
    console.log('🎯 Open http://localhost:5173 to view the document!');
  });
});
