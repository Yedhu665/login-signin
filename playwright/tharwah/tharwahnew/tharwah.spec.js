const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs'); // Added fs module
require('dotenv').config({ path: path.join(__dirname, '.env') });

const logFile = path.join(__dirname, 'test_log.txt');
function log(msg) {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
    console.log(msg);
}

test.describe('Tharwah E2E Scrap Management', () => {

    test('Comprehensive Scrap Category Workflow', async ({ page }) => {
        if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
        log('Starting comprehensive test...');

        // 1. Login
        log(`Using Username: ${process.env.THARWAH_USERNAME ? process.env.THARWAH_USERNAME : 'UNDEFINED'}`);
        await page.goto('https://tharwah.qa/login');
        await page.getByRole('textbox', { name: 'Username' }).fill(process.env.THARWAH_USERNAME || '');
        await page.getByRole('textbox', { name: 'Password' }).fill(process.env.THARWAH_PASSWORD || '');
        await page.getByRole('button', { name: 'Log in' }).click();

        // 2. Wait for login success
        log('Waiting for dashboard redirect...');
        await expect(page).toHaveURL(/.*(dashboard|employee|tharwah\.qa\/$)/, { timeout: 30000 });
        log('Login successful');

        // 3. Navigate to Scrap Category
        // Note: Sidebar items are BUTTONS in the current version of the site
        log('Navigating to Scrap Category...');
        const scrapSettingsBtn = page.getByRole('button', { name: /Scrap Settings/i });
        await scrapSettingsBtn.click();
        log('Clicked Scrap Settings');

        const scrapCategoryLink = page.getByRole('link', { name: /Scrap Category/i });
        await scrapCategoryLink.click();
        log('Clicked Scrap Category');
        await expect(page).toHaveURL(/.*scrap-category/);

        // 4. Add Category
        log('Opening Add Category form...');
        await page.getByRole('button', { name: 'Add Category' }).click();

        // Fill form details
        log('Filling category details...');
        await page.getByLabel('Category Name').fill('metal');

        // Set Is Payable to 'Yes'
        // We use a more specific selector for the option if multiple exist
        await page.getByRole('combobox', { name: /Is Payable/ }).click();
        await page.getByRole('option', { name: 'Yes', exact: true }).click();

        // Set Status to 'Active'
        await page.getByRole('combobox', { name: /Status/ }).click();
        await page.getByRole('option', { name: 'Active', exact: true }).click();

        // 5. Image Upload
        log('Uploading category image...');
        const filePath = 'C:\\Users\\yedhu\\Downloads\\WhatsApp Image 2026-02-10 at 1.38.23 PM.jpeg';
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.getByRole('button', { name: 'Category Image' }).click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(filePath);
        log('Image uploaded');

        // 6. Create
        log('Creating category...');
        await page.getByRole('button', { name: 'Create' }).click();

        // Verification
        log('Verifying category creation...');
        try {
            // Wait for dialog to close (button 'Add Category' becomes visible again or dialog goes away)
            await expect(page.getByRole('button', { name: 'Add Category' })).toBeVisible({ timeout: 15000 });

            // Search for the newly created category in the grid
            // We use getByRole('grid') and look for the text
            await expect(page.getByRole('grid')).toContainText('metal', { timeout: 15000 });
            log('Test Completed Successfully');
        } catch (e) {
            log(`Verification failed: ${e.message}`);
            await page.screenshot({ path: path.join(__dirname, 'verification_failure.png') });
            throw e;
        }
    });

