import { test } from '@playwright/test';

test('verify final position', async ({ page }) => {
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
    
    await entity.locator('button').last().click();
    await page.waitForTimeout(500);
    
    const entityBox = await entity.boundingBox();
    const contextMenu = page.locator('.fixed.z-50').filter({ hasText: 'Edit Entity' }).first();
    const menuBox = await contextMenu.boundingBox();
    
    console.log('\n=== FINAL VERIFICATION ===');
    console.log(`Entity right edge: ${(entityBox!.x + entityBox!.width).toFixed(0)}px`);
    console.log(`Menu left position: ${menuBox!.x.toFixed(0)}px`);
    console.log(`Gap: ${(menuBox!.x - (entityBox!.x + entityBox!.width)).toFixed(0)}px`);
    
    if (menuBox!.x < (entityBox!.x + entityBox!.width)) {
      console.log('\n❌ Menu is to the LEFT of the entity');
    } else {
      const gap = menuBox!.x - (entityBox!.x + entityBox!.width);
      if (gap < 50) {
        console.log(`\n✅ SUCCESS! Menu is ${gap.toFixed(0)}px from entity (very close!)`);
      } else if (gap < 200) {
        console.log(`\n✅ GOOD! Menu is ${gap.toFixed(0)}px from entity`);
      } else {
        console.log(`\n⚠️ Menu is ${gap.toFixed(0)}px from entity (still quite far)`);
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/final-verification.png' });
});
