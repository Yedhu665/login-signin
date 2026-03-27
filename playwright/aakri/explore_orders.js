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

        await page.waitForURL(url => url.href.includes('dashboard') || url.href.includes('customers'), { timeout: 30000 });
        console.log('Login successful, on:', page.url());

        await page.waitForTimeout(3000);
        
        console.log('Clicking DH Waste link by href...');
        const dhWasteLink = page.locator('a[href="/biowaste-order/"]').first();
        if (await dhWasteLink.isVisible()) {
            await dhWasteLink.click();
        } else {
            console.log('DH Waste link not visible, trying to find it in the DOM...');
            // Maybe it's not visible because the menu is closed. Let's try to click the parent first.
            await page.locator('text=Customer Orders').first().click().catch(() => {});
            await page.waitForTimeout(1000);
            await page.locator('a[href="/biowaste-order/"]').first().click();
        }

        console.log('Waiting for DH Waste page to load...');
        await page.waitForURL(url => url.href.includes('biowaste-order'), { timeout: 15000 });
        await page.waitForLoadState('networkidle');
        console.log('On DH Waste Page:', page.url());

        const content = await page.content();
        const fs = require('fs');
        fs.writeFileSync(path.resolve(__dirname, 'orders_dom.txt'), content);
        console.log('Saved DOM to orders_dom.txt');
        
        await page.screenshot({ path: path.resolve(__dirname, 'orders_page_exploration.png'), fullPage: true });

    } catch (e) {
        console.error('DIAGNOSTIC ERROR:', e.message);
        console.error('Stack Trace:', e.stack);
        const errorScreenshot = path.resolve(__dirname, 'error_screenshot.png');
        await page.screenshot({ path: errorScreenshot, fullPage: true }).catch(() => { });
        console.log('Error screenshot saved to:', errorScreenshot);
    } finally {
        await browser.close();
    }
})();
