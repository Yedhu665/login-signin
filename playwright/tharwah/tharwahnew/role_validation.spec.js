const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

test.describe('Tharwah User Role Validation', () => {

    test('Verify validation message for duplicate role "yedhu"', async ({ page }) => {
        // 1. Login
        await page.goto('https://tharwah.qa/login');
        await page.getByRole('textbox', { name: 'Username' }).fill(process.env.THARWAH_USERNAME || '');
        await page.getByRole('textbox', { name: 'Password' }).fill(process.env.THARWAH_PASSWORD || '');
        await page.getByRole('button', { name: 'Log in' }).click();

        // 2. Wait for login success
        await expect(page).toHaveURL(/.*(dashboard|employee|tharwah\.qa\/$)/, { timeout: 30000 });

        // 3. Navigate to User Roles
        await page.getByRole('button', { name: 'User Settings' }).click();
        await page.getByRole('link', { name: 'User Roles' }).click();
        await expect(page).toHaveURL(/.*user-roles/);

        // 4. Try to add Duplicate User Role "yedhu"
        const duplicateRoleName = 'yedhu';

        await page.getByRole('button', { name: 'Add User Role' }).click();
        await page.getByRole('textbox', { name: 'Role Name' }).fill(duplicateRoleName);
        await page.getByRole('button', { name: 'Create' }).click();

        // 5. Verify the validation message
        const validationMessage = page.locator('text=Role with this name already exists');
        await expect(validationMessage).toBeVisible();

        // Optional: take screenshot
        await page.screenshot({ path: 'yedhu_validation_test.png' });

        console.log('Validation message confirmed: "Role with this name already exists"');
    });

});
