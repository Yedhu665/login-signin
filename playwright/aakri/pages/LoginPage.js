const { expect } = require('@playwright/test');

class LoginPage {
    constructor(page) {
        this.page = page;
        this.usernameInput = page.getByRole('textbox', { name: /username/i }).or(page.locator('input[placeholder*="username" i]')).or(page.locator('input[name="username"]')).first();
        this.passwordInput = page.getByRole('textbox', { name: /password/i }).or(page.locator('input[placeholder*="password" i]')).or(page.locator('input[name="password"]')).first();
        this.loginButton = page.getByRole('button', { name: /login/i }).or(page.locator('button[type="submit"]')).first();
    }

    async goto(url) {
        await this.page.goto(url);
    }

    async login(username, password) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        
        // Assertion approach instead of timeout
        await expect(this.page).not.toHaveURL(/.*adminlogin.*/, { timeout: 15000 });
    }
}

module.exports = { LoginPage };
