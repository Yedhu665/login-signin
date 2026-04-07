const { test: setup, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

const authFile = path.join(__dirname, 'storageState.json');

setup('authenticate', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const URL = process.env.URL;
    const USERNAME = process.env.USERNAME;
    const PASSWORD = process.env.PASSWORD;

    if (!URL || !USERNAME || !PASSWORD) {
        throw new Error('Missing environment variables for authentication');
    }

    await loginPage.goto(URL);
    await loginPage.login(USERNAME, PASSWORD);

    // Ensure session is saved
    await page.context().storageState({ path: authFile });
    console.log('Authentication successful and state saved to:', authFile);
});
