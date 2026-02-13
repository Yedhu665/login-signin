const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: './login/.env' });

test('login and save cookies', async ({ page, context }) => {
  await page.goto('https://architect-testing.projectsmate.com/login');
  
  await page.locator('input[type="email"]').first().fill(process.env.EMAIL);
  await page.locator('input[type="password"]').first().fill(process.env.PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  
  await page.waitForTimeout(2000);
  await context.storageState({ path: './login/auth.json' });
  
  expect(page.url()).toContain('architect-testing.projectsmate.com');
});
