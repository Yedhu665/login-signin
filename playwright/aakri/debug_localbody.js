const { chromium } = require('playwright');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto(process.env.URL);
        const usernameInput = page.getByRole('textbox', { name: /username/i }).or(page.locator('input[placeholder*="username" i]')).or(page.locator('input[name="username"]')).first();
        const passwordInput = page.getByRole('textbox', { name: /password/i }).or(page.locator('input[placeholder*="password" i]')).or(page.locator('input[name="password"]')).first();
        const loginButton = page.getByRole('button', { name: /login/i }).or(page.locator('button[type="submit"]')).first();

        await usernameInput.fill(process.env.USERNAME);
        await passwordInput.fill(process.env.PASSWORD);
        await loginButton.click();

        await page.waitForURL(url => url.href.includes('dashboard') || url.href.includes('customers'));
        const baseUrl = new URL(page.url()).origin;
        await page.goto(`${baseUrl}/biowaste-order/`);

        console.log('Selecting Ernakulam...');
        await page.locator('#district').selectOption({ label: 'Ernakulam' });
        
        console.log('Waiting 5s for localbody population...');
        await page.waitForTimeout(5000);

        const options = await page.evaluate(() => {
            const select = document.querySelector('#localbody');
            return Array.from(select.options).map(o => o.text);
        });
        console.log('Localbody Options:', options);

        console.log('Trying to fill end-date...');
        await page.locator('#end-date').fill('2026-03-25');
        const endDateValue = await page.locator('#end-date').inputValue();
        console.log('End Date Value:', endDateValue);

        await page.screenshot({ path: path.resolve(__dirname, 'localbody_check.png') });

    } catch (e) {
        console.error('DIAGNOSTIC ERROR:', e.message);
    } finally {
        await browser.close();
    }
})();
