const { test, expect } = require('@playwright/test');
const { ArchitectLoginPage } = require('./pages/ArchitectLoginPage');
const { ArchitectSignupPage } = require('./pages/ArchitectSignupPage');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'pages', '.env') });

test.describe('Architect Sign Up and Login Flow', () => {

    test('Sign Up Flow', async ({ page }) => {
        const signupPage = new ArchitectSignupPage(page);
        await signupPage.goto();

        const timestamp = Date.now();
        const testUser = {
            name: `Test User ${timestamp}`,
            email: `testuser${timestamp}@example.com`,
            organisation: `Test Org ${timestamp}`,
            password: 'TestPassword123!'
        };

        await signupPage.signup(testUser.name, testUser.email, testUser.organisation, testUser.password);

        // Handle plan selection screen if it appears
        const planHeader = page.getByRole('heading', { name: 'Select a plan to continue' });
        await planHeader.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { });

        if (await planHeader.isVisible()) {
            await page.getByRole('button', { name: 'Choose Starter' }).click();
        }

        // Verify signup success - adjust based on actual behavior (e.g., redirect to login or dashboard)
        await expect(page).toHaveURL(/.*(login|dashboard)/, { timeout: 15000 });
    });

    test('Login Flow', async ({ page }) => {
        const loginPage = new ArchitectLoginPage(page);
        await loginPage.goto();

        await loginPage.login(process.env.EMAIL, process.env.PASSWORD);

        const isSuccess = await loginPage.isLoginSuccessful();
        expect(isSuccess).toBeTruthy();
        expect(page.url()).toContain('dashboard');
    });
});
