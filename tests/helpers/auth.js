const { LoginPage } = require('../pages/LoginPage');

async function login(page, username = 'yedhu', password = 'yedhu@2001') {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, password);
  return await loginPage.isLoginSuccessful();
}

module.exports = { login };
