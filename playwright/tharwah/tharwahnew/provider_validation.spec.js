const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

test.describe('Provider Settings - Add Provider Validations', () => {

    test('Check all field validations in Add Provider form', async ({ page }) => {
        // 1. Login
        await page.goto('https://tharwah.qa/login');
        await page.getByRole('textbox', { name: 'Username' }).fill(process.env.THARWAH_USERNAME || 'admin_new');
        await page.getByRole('textbox', { name: 'Password' }).fill(process.env.THARWAH_PASSWORD || '123');
        await page.getByRole('button', { name: 'Log in' }).click();

        // 2. Wait for login success and navigate to Providers
        await expect(page).toHaveURL(/.*(dashboard|employee|tharwah\.qa\/$)/, { timeout: 30000 });

        // Open Provider Settings submenu
        await page.getByRole('button', { name: 'Provider Settings' }).click();
        // Click Providers link
        await page.getByRole('link', { name: 'Providers' }).click();
        await expect(page).toHaveURL(/.*providers/);

        // 3. Open Add Provider Modal
        await page.getByRole('button', { name: 'Add Provider' }).click();
        await expect(page.getByRole('dialog', { name: 'Add Provider' })).toBeVisible();

        // 4. Validate Fields Sequentially
        // The form seems to show errors one by one or at least we need to trigger them.

        const fieldsToValidate = [
            { label: 'Provider Code', fill: 'P' + Math.floor(Math.random() * 1000), error: 'provider_code is required' },
            { label: 'Name', fill: 'Test Provider', error: 'name is required' },
            { label: 'Role', type: 'combobox', fill: 'manager', error: 'role_id is required' },
            { label: 'Email', fill: 'test@example.com', error: 'email is required' },
            { label: 'Phone Number', fill: '12345678', error: 'phone_number is required' },
            { label: 'Address', fill: '123 Street', error: 'address is required' },
            { label: 'Date of Birth', fill: '1990-01-01', error: 'date_of_birth is required' },
            { label: 'Date of Joining', fill: '2024-01-01', error: 'date_of_joining is required' },
            { label: 'Gender', type: 'combobox', fill: 'Male', error: 'gender is required' },
            { label: 'ID Type', type: 'combobox', fill: 'passport', error: 'id_type is required' },
            { label: 'ID Number', fill: 'ID12345', error: 'id_number is required' }
        ];

        for (const field of fieldsToValidate) {
            console.log(`Checking validation for: ${field.label}`);

            // Click Create to trigger validation
            await page.getByRole('button', { name: 'Create' }).click();

            // Check for error message
            // Based on exploration, errors appear in a paragraph below the field or in a toast/alert.      
            // In exploration Step 64, it appeared in an alert AND a paragraph.
            // Using .first() because multiple error elements might match (toast and helper text)
            await expect(page.getByText(field.error).first()).toBeVisible({ timeout: 5000 });

            // Fill the field to move to next validation
            if (field.type === 'combobox') {
                await page.getByRole('combobox', { name: field.label }).click();
                await page.getByRole('option', { name: field.label === 'Role' ? /Provider/i : field.fill, exact: true }).first().click();
            } else {
                await page.getByRole('textbox', { name: field.label }).fill(field.fill);
            }

            // Short wait to ensure UI updates
            await page.waitForTimeout(500);
        }

        console.log('All required field validations checked successfully.');
    });
});
