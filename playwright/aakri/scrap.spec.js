const { test, expect } = require('@playwright/test');
const { ScrapPage } = require('./pages/ScrapPage');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

// Use storageState from the setup or a relative path
test.use({ storageState: path.join(__dirname, 'storageState.json') });

test.describe('Scrap Order Creation Flow', () => {
    let scrapPage;
    const existingPhone = '9447489109';
    const existingName = 'Bindu M';
    const newPhone = `90${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newName = 'Tester User';
    const addressDetails = {
        district: 'Ernakulam',
        region: 'Edappally',
        address: 'Test House, Ernakulam',
        landmark: 'test order',
        type: 'Home'
    };

    test.beforeEach(async ({ page }) => {
        scrapPage = new ScrapPage(page);
    });

    test('Verify existing phone auto-populates customer name', async ({ page }) => {
        await page.goto(process.env.URL);
        // Fallback to manual navigation if storageState isn't enough to bypass login
        if (page.url().includes('adminlogin')) {
            console.log('StorageState session expired, re-logging (consider running setup)...');
            const { LoginPage } = require('./pages/LoginPage');
            const loginPage = new LoginPage(page);
            await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
        }

        await scrapPage.navigate();
        await scrapPage.enterPhoneNumber(existingPhone);
        await scrapPage.verifyCustomerName(existingName);
    });

    test('Create a new scrap order successfully', async ({ page }) => {
        await page.goto(process.env.URL);
        if (page.url().includes('adminlogin')) {
            const { LoginPage } = require('./pages/LoginPage');
            const loginPage = new LoginPage(page);
            await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
        }

        await scrapPage.navigate();
        
        // 1. Enter new phone and manually enter name
        await scrapPage.enterPhoneNumber(newPhone);
        await scrapPage.enterCustomerName(newName);

        // 2. Select scheduled date as today
        await scrapPage.selectToday();

        // 3. Add New Address
        await scrapPage.openNewAddressModal();
        await scrapPage.fillAddressDetails(addressDetails);

        // 4. Select Pickup Item
        await scrapPage.selectPickupItem('News Paper');

        // 5. Submit Order
        await scrapPage.submit();

        // 6. Validate: Order created successfully
        await expect(page.locator('text=Order created successfully')).toBeVisible({ timeout: 15000 });
        
        // Final verification message
        console.log(`Success: Order created for ${newName} (${newPhone})`);
    });

});
