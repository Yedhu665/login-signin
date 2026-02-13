class ArchitectSignupPage {
    constructor(page) {
        this.page = page;
        this.nameInput = page.locator('input[name="name"]');
        this.emailInput = page.locator('input[name="email"]');
        this.organisationInput = page.locator('input[name="organisationName"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.createAccountButton = page.getByRole('button', { name: 'Create Account' });
    }

    async goto() {
        await this.page.goto('https://architect-testing.projectsmate.com/signup');
    }

    async signup(name, email, organisation, password) {
        await this.nameInput.fill(name);
        await this.emailInput.fill(email);
        await this.organisationInput.fill(organisation);
        await this.passwordInput.fill(password);
        await this.createAccountButton.click();
        await this.page.waitForLoadState('networkidle');
    }
}

module.exports = { ArchitectSignupPage };
