class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator("#username");
    this.passwordInput = page.locator("#password");
    this.submitButton = page.locator("#submit-form");
  }

  async goto() {
    await this.page.goto('https://aakri.in/adminlogin/');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isLoginSuccessful() {
    await this.page.waitForURL('**/analytics-dashboard/**', { timeout: 10000 });
    return this.page.url().includes('analytics-dashboard');
  }
}

module.exports = { LoginPage };
