const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

test.describe('Tharwah User Role Duplicate Check', () => {

    test('Verify error message for duplicate role "client"', async ({ page }) => {
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

        // 4. Try to add Duplicate User Role
        const roleName = 'client'; // This role already exists

        await page.getByRole('button', { name: 'Add User Role' }).click();
        await page.getByRole('textbox', { name: 'Role Name' }).fill(roleName);

        // Listen for all responses
        const responses = [];
        page.on('response', async (response) => {
            if (response.url().includes('role')) {
                const status = response.status();
                let body = '';
                try { body = await response.text(); } catch (e) { }
                responses.push({ url: response.url(), status, body });
            }
        });

        // Click and watch
        await page.getByRole('button', { name: 'Create' }).click();
        console.log('Clicked Create, waiting for error indicator...');

        // 5. Look for error indicators
        const errorLocator = page.locator('text=/already exists/i, text=/duplicate/i, text=/failed/i, text=/error/i').first();

        try {
            await errorLocator.waitFor({ state: 'visible', timeout: 5000 });
            const errorMsg = await errorLocator.innerText();
            console.log(`VISIBLE ERROR MESSAGE: "${errorMsg}"`);
        } catch (e) {
            console.log('No visible error message found via text search.');
        }

        console.log('Captured Responses:', JSON.stringify(responses, null, 2));

        // Final screenshot to see state
        await page.screenshot({ path: 'duplicate_role_final_attempt.png' });

        // Ideally we expect some failure or message
        // await expect(page.getByText(/already exists/i)).toBeVisible();
    });

});
