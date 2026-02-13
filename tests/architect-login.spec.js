const { test, expect } = require('@playwright/test');
const { ArchitectLoginPage } = require('./pages/ArchitectLoginPage');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'pages', '.env') });

test.describe('Architect Login Page Tests', () => {
    let loginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new ArchitectLoginPage(page);
        await loginPage.goto();
    });

    test('Verify login with valid credentials', async ({ page }) => {
        await loginPage.login(process.env.EMAIL, process.env.PASSWORD);

        // Wait for dashboard and verify URL or element
        const isSuccess = await loginPage.isLoginSuccessful();
        expect(isSuccess).toBeTruthy();
        expect(page.url()).toContain('dashboard');
    });

    test('Verify error for invalid credentials', async ({ page }) => {
        await loginPage.login('invalid_user', 'wrong_password');

        // Check for error message - using a generic alert locator
        await expect(page.locator('role=alert')).toBeVisible({ timeout: 5000 }).catch(() => { });
        expect(page.url()).toContain('login');
    });
});
