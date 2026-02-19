import { test } from '@playwright/test';

test('debug DOM structure', async ({ page }) => {
    page.on('console', msg => console.log(msg.text()));

    await page.goto('http://localhost:5173/erd-editor');
    await page.waitForTimeout(2000);

    // Add Entity
    const buttons = page.locator('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const text = await buttons.nth(i).evaluate(el => el.textContent);
      if (text?.includes('Add Entity')) {
        await buttons.nth(i).click();
        await page.waitForTimeout(500);
        break;
      }
    }

    await page.locator('input').first().fill('TestEntity');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    const entity = page.locator('.entity-node').first();
    await entity.hover({ force: true });
    await page.waitForTimeout(1000);
    
    const quickBtn = entity.locator('button').last();
    const btnBox = await quickBtn.boundingBox();
    console.log('Button bounding box:', btnBox);
    
    await quickBtn.click();
    await page.waitForTimeout(500);
    
    // Find all fixed menus
    const allMenus = await page.locator('.fixed.z-50').all();
    console.log(`\nTotal .fixed.z-50 elements: ${allMenus.length}`);
    
    for (let i = 0; i < allMenus.length; i++) {
      const menu = allMenus[i];
      const visible = await menu.isVisible();
      if (visible) {
        const box = await menu.boundingBox();
        const styles = await menu.evaluate(el => ({
          left: el.style.left,
          top: el.style.top,
          position: el.style.position,
          transform: el.style.transform
        }));
        const text = await menu.textContent();
        console.log(`\nMenu ${i}:`);
        console.log(`  Visible: ${visible}`);
        console.log(`  Bounding box: x=${box?.x.toFixed(0)}, y=${box?.y.toFixed(0)}`);
        console.log(`  Styles:`, styles);
        console.log(`  Text: "${text?.trim().substring(0, 30)}"`);
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/debug-dom-structure.png' });
});
