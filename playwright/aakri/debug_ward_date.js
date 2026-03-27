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

        await page.selectOption('#district', '1');
        await page.locator('#district').dispatchEvent('change');
        
        await page.waitForFunction(() => {
            const select = document.querySelector('#localbody');
            return select && Array.from(select.options).some(o => o.text.includes('Cochin'));
        });

        await page.selectOption('#localbody', { label: 'Cochin' });
        await page.locator('#localbody').dispatchEvent('change');
        await page.waitForLoadState('networkidle');

        console.log('Checking Ward options...');
        await page.locator('.select2-selection--multiple').click();
        await page.waitForTimeout(2000); // wait for Select2 to populate

        const wardOptions = await page.evaluate(() => {
            const results = document.querySelectorAll('.select2-results__option');
            return Array.from(results).map(r => r.innerText.trim());
        });
        console.log('Ward Options for Cochin:', wardOptions);

        console.log('Debugging End Date fill...');
        const endDate = page.locator('#end-date');
        await endDate.focus();
        await page.keyboard.type('2026-03-25');
        console.log('End Date after type:', await endDate.inputValue());
        
        await endDate.fill('2026-03-25');
        console.log('End Date after fill:', await endDate.inputValue());

    } catch (e) {
        console.error('DIAGNOSTIC ERROR:', e.message);
    } finally {
        await browser.close();
    }
})();
