const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { OrdersPage } = require('./pages/OrdersPage');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

test.describe('DH Orders Filter Automation', () => {
    
    test('Filter and Verify Completed DH Orders in Cochin', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const ordersPage = new OrdersPage(page);

        // 1) Authentication
        await loginPage.goto(process.env.URL);
        await loginPage.login(process.env.USERNAME, process.env.PASSWORD);

        // 2) Navigation to DH Orders
        const baseUrl = new URL(page.url()).origin;
        await page.goto(`${baseUrl}/biowaste-order/`);
        await expect(page).toHaveURL(/.*biowaste-order.*/);

        // 3) Apply Filters
        console.log('Applying Filters...');
        await ordersPage.selectStatus('Completed');
        await ordersPage.selectDistrict('Ernakulam');
        
        // User requested Cochin and Edappally
        // We assume Cochin is a Local Body in Ernakulam
        await ordersPage.selectLocalbody('Cochin'); 
        await ordersPage.selectWard('(37) - EDAPPALLY');

        // Date Range: 01-Mar-2026 to 25-Mar-2026
        // Input type="date" requires YYYY-MM-DD
        await ordersPage.setDateRange('2026-03-01', '2026-03-25');

        await ordersPage.applyFilter();

        // 4) Verification
        console.log('Verifying Results...');
        await ordersPage.verifyResults('Completed', 'Cochin', 'Edappally');
        
        // Check for absence of error messages
        await expect(page.locator('.alert-danger, .error-message')).not.toBeVisible();
        
        console.log('Test Completed Successfully!');
    });

    test.afterEach(async ({ page }, testInfo) => {
        if (testInfo.status !== testInfo.expectedStatus) {
            const screenshotPath = `test-failure-dhorders.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`Test failed! Screenshot saved to ${screenshotPath}`);
        }
    });
});
