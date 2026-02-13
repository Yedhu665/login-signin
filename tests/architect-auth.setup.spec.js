const { test: setup } = require('@playwright/test');
const { ArchitectLoginPage } = require('./pages/ArchitectLoginPage');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'pages', '.env') });

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    const loginPage = new ArchitectLoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.EMAIL, process.env.PASSWORD);

    // Wait for login to be successful
    const success = await loginPage.isLoginSuccessful();
    if (!success) {
        throw new Error('Login failed during authentication setup');
    }

    await page.context().storageState({ path: authFile });
});
