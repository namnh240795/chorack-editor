import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';

async function testUIWithVision() {
  let browser: Browser | undefined;
  let context: BrowserContext | undefined;
  let page: Page | undefined;

  try {
    console.log('🚀 Starting browser...');

    // Launch browser in headed mode so you can see it
    browser = await chromium.launch({
      headless: false,
      slowMo: 500, // Slow down actions for visibility
    });

    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });

    page = await context.newPage();

    // Start the dev server and navigate to it
    console.log('📄 Navigating to app...');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('✅ Page loaded successfully!');
    console.log('📸 Taking initial screenshot...');
    await page.screenshot({
      path: 'screenshots/initial-state.png',
      fullPage: true,
    });

    // Wait a bit to let animations finish
    await page.waitForTimeout(2000);

    // Interact with the page (example: click button)
    console.log('🖱️ Interacting with UI...');
    try {
      // Try to find and click the count button
      const button = page.locator('button').first();
      await button.click();
      await page.waitForTimeout(500);

      console.log('📸 Taking screenshot after interaction...');
      await page.screenshot({
        path: 'screenshots/after-click.png',
        fullPage: true,
      });
    } catch (error) {
      console.log('⚠️  Could not find button to click, skipping interaction');
    }

    console.log('✨ Screenshots saved to ./screenshots/');
    console.log('👀 You can now share these screenshots with Claude for vision analysis!');

    // Keep browser open for manual inspection
    console.log('\n🔍 Browser will stay open for 30 seconds for manual inspection...');
    console.log('   (Press Ctrl+C to close earlier)');

    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    // Cleanup
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

// Run the test
testUIWithVision().catch(console.error);
