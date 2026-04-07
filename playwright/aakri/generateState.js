const { chromium } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const URL = process.env.URL;
    const USERNAME = process.env.USERNAME;
    const PASSWORD = process.env.PASSWORD;

    console.log(`Logging in to ${URL}...`);
    const loginPage = new LoginPage(page);
    await loginPage.goto(URL);
    await loginPage.login(USERNAME, PASSWORD);
    
    // Save the storage state
    await context.storageState({ path: path.join(__dirname, 'storageState.json') });
    console.log('storageState.json created successfully');
    
    await browser.close();
})();

