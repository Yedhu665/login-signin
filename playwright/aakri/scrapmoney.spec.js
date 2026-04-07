const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

test.use({ storageState: path.join(__dirname, 'storageState.json') });

test.describe('Scrap Money Balance Update Flow', () => {

    test('Crediting customer scrap money balance', async ({ page }) => {
        // Step 1: Navigate to the dashboard after page load is complete
        await page.goto(process.env.URL);
        await page.waitForLoadState('networkidle');

        if (page.url().includes('adminlogin')) {
            const { LoginPage } = require('./pages/LoginPage');
            const loginPage = new LoginPage(page);
            await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
            await page.waitForLoadState('networkidle');
        }

        await page.goto(process.env.URL.replace('adminlogin/', 'customers/'));
        await page.waitForLoadState('networkidle');

        // Step 2: Locate the "Customer" search field
        const searchInput = page.locator('input[type="search"]').first();
        await expect(searchInput).toBeVisible({ timeout: 10000 });
        
        await searchInput.click();
        await searchInput.fill(process.env.MOBILE_NUMBER);

        // Wait for customer suggestions/results to appear
        const customerRow = page.locator('table tbody tr', { hasText: process.env.MOBILE_NUMBER }).first();
        await expect(customerRow).toBeVisible({ timeout: 15000 });

        // Step 3: Locate and click on the "Scrap Money" section/field
        // We click the Scrap Money Transaction icon inside the specific customer row
        const scrapMoneyBtn = customerRow.locator('a[href*="/get-scrap-money-transactions/"]');
        await expect(scrapMoneyBtn).toBeVisible({ timeout: 15000 });
        
        // Handle potential new tab navigation, as DataTables links often use target="_blank"
        const targetAttr = await scrapMoneyBtn.getAttribute('target');
        let actionPage = page;
        
        if (targetAttr === '_blank') {
            const [newPage] = await Promise.all([
                page.context().waitForEvent('page'),
                scrapMoneyBtn.click()
            ]);
            actionPage = newPage;
        } else {
            // For same-page navigation
            await scrapMoneyBtn.click();
        }
        await actionPage.waitForLoadState('networkidle');

        // Step 4: Click on the "Edit Balance" button
        // Multiple "Edit Balance" buttons might exist (e.g., hidden mobile/desktop variations). Filter by :visible
        const editBalanceBtn = actionPage.locator('button:has-text("Edit Balance"):visible, a:has-text("Edit Balance"):visible, *:has-text("Edit Balance"):visible').last();
        await expect(editBalanceBtn).toBeVisible({ timeout: 15000 });
        await editBalanceBtn.click();

        // Step 5: In the balance update modal/page: Select "Credit", enter "100", validate
        const creditOption = actionPage.locator('input[type="radio"][value="Credit"], input[type="radio"][value="credit"], input[value="Credit"], label:has-text("Credit")').first();
        await creditOption.click();

        const amountInput = actionPage.locator('input[type="number"], input[name="amount"]').first();
        await expect(amountInput).toBeVisible();
        await amountInput.fill('100');
        
        const val = await amountInput.inputValue();
        expect(Number(val)).toBe(100);

        // Step 6: Click "Submit" or "Save" button
        const submitBtn = actionPage.locator('button:has-text("Submit"), button:has-text("Save")').first();
        await submitBtn.click();

        // Step 7: Verify success message
        const toastMessage = actionPage.locator('.toast, .alert-success, text="success", text="updated"').first();
        await expect(toastMessage).toBeVisible({ timeout: 15000 });

        // Step 8: Log and screenshot
        await actionPage.screenshot({ path: 'balance_updated.png' });
        console.log('Balance successfully updated for', process.env.MOBILE_NUMBER);
    });
});
