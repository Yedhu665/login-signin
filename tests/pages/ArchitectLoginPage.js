class ArchitectLoginPage {
    constructor(page) {
        this.page = page;
        this.emailInput = page.locator('input[name="email"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.signupLink = page.getByRole('link', { name: 'Create new account' });
    }

    async goto() {
        await this.page.goto('https://architect-testing.projectsmate.com/login');
    }

    async login(email, password) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async isLoginSuccessful() {
        // Check for a characteristic element of the dashboard or URL change
        await this.page.waitForURL('**/dashboard/**', { timeout: 10000 }).catch(() => { });
        return this.page.url().includes('dashboard');
    }
}

module.exports = { ArchitectLoginPage };
