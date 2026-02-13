const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { testData } = require('./fixtures/testData');

test.describe('Authentication Tests', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Valid login redirects to dashboard', async ({ page }) => {
    await loginPage.login(testData.validCredentials.username, testData.validCredentials.password);
    const isSuccess = await loginPage.isLoginSuccessful();
    expect(isSuccess).toBeTruthy();
    expect(page.url()).toContain('analytics-dashboard');
  });

  test('Invalid credentials show error', async ({ page }) => {
    await loginPage.login('invalid', 'wrong');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('adminlogin');
  });

  test('Empty fields validation', async ({ page }) => {
    await loginPage.submitButton.click();
    const usernameRequired = await loginPage.usernameInput.evaluate(el => el.validity.valueMissing);
    expect(usernameRequired).toBeTruthy();
  });
});
