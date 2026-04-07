const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ storageState: path.join(__dirname, 'storageState.json') });
  const page = await context.newPage();
  await page.goto('https://aakri.in/analytics-dashboard/', { waitUntil: 'load' });
  
  const placeholders = await page.$$eval('input', els => els.map(el => el.placeholder).filter(p => p));
  console.log('Placeholders:', placeholders);
  
  await browser.close();
})();
