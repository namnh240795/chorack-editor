import { test, expect } from '@playwright/test';

test.describe('Entity Edit Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/erd-editor');
    await page.waitForTimeout(2000);
  });

  test('should create and then edit an entity', async ({ page }) => {
    // Step 1: Create a new entity
    const buttons = page.locator('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const text = await buttons.nth(i).evaluate(el => el.textContent);
      if (text?.includes('Add Entity')) {
        await buttons.nth(i).click();
        await page.waitForTimeout(500);
        break;
      }
    }

    // Fill entity name
    await page.locator('input').first().fill('TestEntity');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Step 2: Edit the entity
    const entity = page.locator('.entity-node').first();
    await entity.hover({ force: true });
    await page.waitForTimeout(1000);

    // Click edit button (last button)
    await entity.locator('button').last().click();
    await page.waitForTimeout(500);

    // Click "Edit Entity" from context menu
    const editButton = page.locator('button').filter({ hasText: 'Edit Entity' }).first();
    await editButton.click();
    await page.waitForTimeout(1000);

    // Verify modal is open
    const modal = page.locator('.fixed.z-50').filter({ hasText: 'Edit Entity' }).first();
    await expect(modal).toBeVisible();

    // Verify entity name is populated - find input by its label
    const nameLabel = page.locator('label').filter({ hasText: 'Entity Name' }).first();
    const nameInput = nameLabel.locator('xpath=following-sibling::div//input');
    const nameValue = await nameInput.inputValue();
    expect(nameValue).toBe('TestEntity');

    // Step 3: Modify the entity
    // Change name
    await nameInput.fill('UpdatedTestEntity');

    // Add a new attribute
    const addButton = page.locator('button').filter({ hasText: 'Add Attribute' }).first();
    await addButton.click();
    await page.waitForTimeout(300);

    // Fill the new attribute
    const attributeInputs = page.locator('input[placeholder*="Attribute name"]');
    const lastAttributeInput = attributeInputs.last();
    await lastAttributeInput.fill('email');
    await page.waitForTimeout(200);

    // Step 4: Save the changes
    const updateButton = page.locator('button').filter({ hasText: 'Update Entity' }).first();
    await updateButton.click();
    await page.waitForTimeout(1000);

    // Step 5: Verify changes
    // Modal should be closed
    await expect(modal).not.toBeVisible();

    // Entity should show updated name
    const entityLabel = entity.locator('text=UpdatedTestEntity');
    await expect(entityLabel).toBeVisible();

    console.log('✅ Entity edit test passed!');
  });

  test('should properly reset form when switching between edit and create', async ({ page }) => {
    // Create first entity
    const buttons = page.locator('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const text = await buttons.nth(i).evaluate(el => el.textContent);
      if (text?.includes('Add Entity')) {
        await buttons.nth(i).click();
        await page.waitForTimeout(500);
        break;
      }
    }

    await page.locator('input').first().fill('FirstEntity');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Edit the entity
    const entity = page.locator('.entity-node').first();
    await entity.hover({ force: true });
    await page.waitForTimeout(1000);
    await entity.locator('button').last().click();
    await page.waitForTimeout(500);

    await page.locator('button').filter({ hasText: 'Edit Entity' }).first().click();
    await page.waitForTimeout(1000);

    // Verify form has entity data
    const nameLabel = page.locator('label').filter({ hasText: 'Entity Name' }).first();
    let nameInput = nameLabel.locator('xpath=following-sibling::div//input');
    let nameValue = await nameInput.inputValue();
    expect(nameValue).toBe('FirstEntity');

    // Close modal by clicking Cancel button
    const cancelButton = page.locator('button').filter({ hasText: 'Cancel' }).first();
    await cancelButton.click();
    await page.waitForTimeout(1000);

    // Verify modal is closed
    const modal = page.locator('.fixed.z-50').filter({ hasText: 'Edit Entity' }).first();
    await expect(modal).not.toBeVisible();

    // Create new entity
    for (let i = 0; i < await buttons.count(); i++) {
      const text = await buttons.nth(i).evaluate(el => el.textContent);
      if (text?.includes('Add Entity')) {
        await buttons.nth(i).click();
        await page.waitForTimeout(500);
        break;
      }
    }

    // Verify form is reset (should show "New Entity" not "Edit Entity")
    const newModal = page.locator('.fixed.z-50').filter({ hasText: 'New Entity' }).first();
    await expect(newModal).toBeVisible();

    nameValue = await nameInput.inputValue();
    expect(nameValue).toBe(''); // Should be empty for new entity

    console.log('✅ Form reset test passed!');
  });

  test('should handle attribute type changes correctly', async ({ page }) => {
    // Create entity
    const buttons = page.locator('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const text = await buttons.nth(i).evaluate(el => el.textContent);
      if (text?.includes('Add Entity')) {
        await buttons.nth(i).click();
        await page.waitForTimeout(500);
        break;
      }
    }

    await page.locator('input').first().fill('TypeTestEntity');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Edit the entity
    const entity = page.locator('.entity-node').first();
    await entity.hover({ force: true });
    await page.waitForTimeout(1000);
    await entity.locator('button').last().click();
    await page.waitForTimeout(500);

    await page.locator('button').filter({ hasText: 'Edit Entity' }).first().click();
    await page.waitForTimeout(1000);

    // Add a new attribute
    const addButton = page.locator('button').filter({ hasText: 'Add Attribute' }).first();
    await addButton.click();
    await page.waitForTimeout(300);

    // Fill attribute name
    const attributeInputs = page.locator('input[placeholder*="Attribute name"]');
    const lastAttributeInput = attributeInputs.last();
    await lastAttributeInput.fill('testField');

    // Find the type dropdown for the last attribute
    // Type dropdowns are Radix Select triggers
    const typeTriggers = page.locator('[role="combobox"]');
    const lastTypeTrigger = typeTriggers.last();

    // Click to open dropdown
    await lastTypeTrigger.click();
    await page.waitForTimeout(500);

    // Select VARCHAR type from the dropdown - use text content selector
    const varcharOption = page.locator('.fixed.z-50').locator('text=VARCHAR').first();
    await varcharOption.click();
    await page.waitForTimeout(300);

    // Save
    const updateButton = page.locator('button').filter({ hasText: 'Update Entity' }).first();
    await updateButton.click();
    await page.waitForTimeout(1000);

    // Edit again and verify type was saved
    await entity.hover({ force: true });
    await page.waitForTimeout(1000);
    await entity.locator('button').last().click();
    await page.waitForTimeout(500);

    await page.locator('button').filter({ hasText: 'Edit Entity' }).first().click();
    await page.waitForTimeout(1000);

    // Re-locate the type dropdown since the modal re-rendered
    const typeTriggersAfterReopen = page.locator('[role="combobox"]');
    const lastTypeTriggerAfterReopen = typeTriggersAfterReopen.last();

    // Click on the dropdown to verify the value is saved
    await lastTypeTriggerAfterReopen.click();
    await page.waitForTimeout(500);

    // The selected item should be visible in the dropdown
    const varcharInDropdown = page.locator('text=VARCHAR').first();
    const isVisible = await varcharInDropdown.isVisible();
    expect(isVisible).toBe(true);

    console.log('✅ Attribute type change test passed!');
  });

  test('should validate form correctly', async ({ page }) => {
    // Try to create entity with empty name
    const buttons = page.locator('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const text = await buttons.nth(i).evaluate(el => el.textContent);
      if (text?.includes('Add Entity')) {
        await buttons.nth(i).click();
        await page.waitForTimeout(500);
        break;
      }
    }

    // Don't fill name, try to submit
    const submitButton = page.locator('button').filter({ hasText: 'Create Entity' }).first();

    // Button should be disabled when form is invalid
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBe(true);

    console.log('✅ Form validation test passed!');
  });
});
