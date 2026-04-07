const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

test.describe('Provider Management', () => {

    test('Add Provider with specific details', async ({ page }) => {
        // 1. Login
        console.log('Navigating to login page...');
        await page.goto('https://tharwah.qa/login');
        console.log('Filling username...');
        await page.getByRole('textbox', { name: 'Username' }).fill(process.env.THARWAH_USERNAME || 'admin_new');
        console.log('Filling password...');
        await page.getByRole('textbox', { name: 'Password' }).fill(process.env.THARWAH_PASSWORD || '123');
        await page.getByRole('button', { name: 'Log in' }).click();

        // 2. Wait for login success
        console.log('Wait for dashboard redirect...');
        await expect(page).toHaveURL(/.*(dashboard|employee|tharwah\.qa\/$)/, { timeout: 30000 });

        // 3. Navigate to Providers
        console.log('Navigating to Providers...');
        await page.getByRole('button', { name: 'Provider Settings' }).click();
        await page.getByRole('link', { name: 'Providers' }).click();
        await expect(page).toHaveURL(/.*providers/);

        // 4. Open Add Provider Modal
        console.log('Opening Add Provider Modal...');
        await page.getByRole('button', { name: 'Add Provider' }).click();
        await expect(page.getByRole('dialog', { name: 'Add Provider' })).toBeVisible();

        // 5. Fill Form Details
        console.log('Filling Provider details...');

        // Provider Code
        await page.getByRole('textbox', { name: 'Provider Code' }).fill('QAR2255');

        // Name
        await page.getByRole('textbox', { name: 'Name' }).fill('tester');

        // Role (Combobox)
        console.log('Selecting Role...');
        await page.getByRole('combobox', { name: 'Role' }).click();
        await page.getByRole('option', { name: 'manager', exact: true }).click();

        // Email
        await page.getByRole('textbox', { name: 'Email' }).fill('tester@aakri.in');

        // Phone Number (Input provided: 7025942479, but app expects 8 digits. Using 70259424)
        console.log('Filling Phone Number...');
        await page.getByRole('textbox', { name: 'Phone Number' }).fill('70259424');

        // Address
        await page.getByRole('textbox', { name: 'Address' }).fill('Test Address 123');

        // Date of Birth
        await page.getByRole('textbox', { name: 'Date of Birth' }).fill('2001-11-19');

        // Date of Joining
        await page.getByRole('textbox', { name: 'Date of Joining' }).fill('2026-02-19');

        // Gender
        console.log('Selecting Gender...');
        await page.getByRole('combobox', { name: 'Gender' }).click();
        await page.getByRole('option', { name: 'Male', exact: true }).click();

        // ID Type
        console.log('Selecting ID Type...');
        await page.getByRole('combobox', { name: 'ID Type' }).click();
        await page.getByRole('option', { name: 'Qatari ID', exact: true }).click();

        // ID Number
        await page.getByRole('textbox', { name: 'ID Number' }).fill('2255');

        // 6. Upload Profile Picture
        console.log('Uploading profile picture...');
        const profilePicPath = 'C:\\Users\\yedhu\\Downloads\\WhatsApp Image 2026-02-10 at 1.38.23 PM.jpeg';
        if (fs.existsSync(profilePicPath)) {
            const fileChooserPromise = page.waitForEvent('filechooser');
            await page.getByRole('button', { name: 'Upload Profile Picture' }).click();
            const fileChooser = await fileChooserPromise;
            await fileChooser.setFiles(profilePicPath);
        } else {
            console.warn(`Profile picture not found at ${profilePicPath}`);
        }

        // 7. Upload Document
        console.log('Uploading document...');
        const docPath = 'C:\\Users\\yedhu\\Downloads\\Yedhu_Software_Tester.pdf';
        if (fs.existsSync(docPath)) {
            const fileChooserPromise = page.waitForEvent('filechooser');
            await page.getByRole('button', { name: 'Upload Document' }).click();
            const fileChooser = await fileChooserPromise;
            await fileChooser.setFiles(docPath);
        } else {
            console.warn(`Document not found at ${docPath}`);
        }

        // 8. Create
        console.log('Clicking Create...');
        await page.getByRole('button', { name: 'Create', exact: true }).click();

        // 9. Verification
        console.log('Verifying provider creation...');
        try {
            // Wait for the modal to close or the provider to appear in the grid
            await expect(page.getByRole('dialog', { name: 'Add Provider' })).not.toBeVisible({ timeout: 20000 });
            console.log('Modal closed.');
        } catch (e) {
            console.log('Modal did not close. Checking for errors...');
            await page.screenshot({ path: path.join(__dirname, 'create_failed_final.png') });
            throw e;
        }

        // Search or check grid
        await expect(page.getByRole('grid')).toContainText('tester', { timeout: 15000 });
        await expect(page.getByRole('grid')).toContainText('QAR2255', { timeout: 15000 });

        console.log('Test completed successfully: Provider "tester" (QAR2255) added.');
        await page.screenshot({ path: path.join(__dirname, 'success_final.png') });
    });

});
