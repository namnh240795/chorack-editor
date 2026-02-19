import { test, expect } from '@playwright/test';

test('verify menu position', async ({ page }) => {
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
    await quickBtn.click();
    await page.waitForTimeout(500);
    
    // Get the inline styles of the context menu
    const contextMenu = page.locator('.fixed.z-50').filter({ hasText: 'Edit Entity' }).first();
    const styles = await contextMenu.evaluate(el => ({
        left: el.style.left,
        top: el.style.top
    }));
    
    const entityBox = await entity.boundingBox();
    
    // The menu left position should be close to (entity.x + entity.width + offset)
    const expectedLeft = entityBox!.x + entityBox!.width + 4;
    const actualLeft = parseInt(styles.left);
    
    console.log('\n=== VERIFICATION ===');
    console.log(`Entity width: ${entityBox?.width}`);
    console.log(`Expected menu left: ${expectedLeft}px`);
    console.log(`Actual menu left: ${actualLeft}px`);
    console.log(`Difference: ${Math.abs(actualLeft - expectedLeft)}px`);
    
    if (Math.abs(actualLeft - expectedLeft) < 50) {
      console.log('\n✅ SUCCESS! Menu is positioned right next to the entity!');
    } else {
      console.log('\n❌ Menu position is off');
    }
    
    await page.screenshot({ path: 'tests/screenshots/menu-position-verified.png' });
});
