const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

const USERNAME = process.env.USERNAME || process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const URL = process.env.URL;

test.describe('Login Functionality Verification', () => {

    test('Verify successful login with valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);

        // 1) Verify Environment Variables
        console.log('--- Environment Check ---');
        console.log('URL:', URL);
        console.log('USERNAME:', USERNAME);
        if (!USERNAME || !PASSWORD || !URL) {
            throw new Error('Missing USERNAME, PASSWORD or URL in .env file');
        }
        console.log('-------------------------');

        // 2) Navigate to the target URL
        console.log('Navigating to:', URL);
        await loginPage.goto(URL);
        await expect(page).toHaveTitle(/Login/i);

        // 3) Fill credentials and verify population
        console.log('Filling credentials...');
        await loginPage.usernameInput.fill(USERNAME);
        await loginPage.passwordInput.fill(PASSWORD);

        // Verify fields are populated
        const filledUser = await loginPage.usernameInput.inputValue();
        const filledPass = await loginPage.passwordInput.inputValue();
        expect(filledUser).toBe(USERNAME);
        expect(filledPass).toBe(PASSWORD);
        console.log('Fields verified correctly.');

        // 4) Click Login
        console.log('Clicking Login button...');
        await loginPage.loginButton.click();

        // 5) Validate login success (redirection)
        try {
            // Expect redirection to dashboard or admin page (not login page)
            await page.waitForURL((url) => {
                const u = url.toString();
                return (u.includes('dashboard') || u.includes('customers') || u.includes('admin')) && !u.includes('adminlogin');
            }, { timeout: 15000 });
            
            console.log('Login Successful! Current URL:', page.url());
            await expect(page.locator('.alert, [role="alert"]')).not.toBeVisible();
        } catch (e) {
            // Capture and log error message if login fails
            const errorText = await page.locator('.alert, [role="alert"]').innerText().catch(() => 'No visible alert');
            console.error('Login Failed! Captured Error:', errorText);
            await page.screenshot({ path: 'login-failure-debug.png', fullPage: true });
            throw new Error(`Login Validation Failed: ${errorText}`);
        }
    });

});
