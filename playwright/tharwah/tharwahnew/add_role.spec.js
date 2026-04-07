const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

test.describe('Tharwah User Role Management', () => {

    const rolesToAdd = ['client', 'yedhu', 'existing user role'];

    for (const roleName of rolesToAdd) {
        test(`Add User Role "${roleName}"`, async ({ page }) => {
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

            // 4. Add User Role
            // Search if already exists
            await page.getByPlaceholder('Search role').fill(roleName);
            await page.waitForTimeout(2000); // Wait for search results

            const exists = await page.getByRole('grid').locator('text=' + roleName).isVisible();

            if (!exists) {
                await page.getByRole('button', { name: 'Add User Role' }).click();
                await page.getByRole('textbox', { name: 'Role Name' }).fill(roleName);
                await page.getByRole('button', { name: 'Create' }).click();

                // Wait for modal to close or toast to appear
                await page.waitForTimeout(2000);
            } else {
                console.log(`Role "${roleName}" already exists, skipping creation.`);
            }

            // 5. Verification
            try {
                await expect(page.getByRole('grid')).toContainText(roleName, { timeout: 15000 });
            } catch (e) {
                await page.screenshot({ path: `add_role_${roleName}_failure.png` });
                throw e;
            }
        });
    }

});
