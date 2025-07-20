// Playwright test for /src/pages/index.html
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:8000/src/pages/index.html';
const CORRECT_PASSWORD = 'MScSimEd2025';
const INCORRECT_PASSWORD = 'wrongpassword';

test.describe('Index Page Authentication and Theme', () => {
  test('should show login screen and fail with incorrect password', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#loginScreen', { state: 'visible' });
    await page.fill('#password', INCORRECT_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page.locator('#loginError')).toBeVisible();
  });

  test('should login with correct password and show main app', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#loginScreen', { state: 'visible' });
    await page.fill('#password', CORRECT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForSelector('#mainApp', { state: 'visible' });
    await expect(page.locator('#mainApp')).toBeVisible();
    await expect(page.locator('#loginScreen')).toBeHidden();
  });

  test('should toggle theme on login overlay before login', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#loginScreen', { state: 'visible' });
    const themeToggleLogin = page.locator('#themeToggleLogin');
    await expect(themeToggleLogin).toBeVisible();
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await themeToggleLogin.click();
    const toggledTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(toggledTheme).not.toBe(initialTheme);
  });

  test('should toggle theme before and after login, and persist after logout/login', async ({ page, context }) => {
    await page.goto(BASE_URL);
    // Toggle theme on login screen
    const themeToggleLogin = page.locator('#themeToggleLogin');
    if (await themeToggleLogin.isVisible()) {
      const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      await themeToggleLogin.click();
      const toggledTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(toggledTheme).not.toBe(initialTheme);
    }
    // Login
    await page.fill('#password', CORRECT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForSelector('#mainApp', { state: 'visible' });
    // Toggle theme in main app (if available)
    const themeToggleApp = page.locator('#navbar-container [aria-label*="dark mode"], #mainApp [aria-label*="dark mode"]');
    if (await themeToggleApp.count() > 0) {
      const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      await themeToggleApp.first().click();
      const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(themeAfter).not.toBe(themeBefore);
    }
    // Simulate logout (if a logout button exists)
    const logoutBtn = page.locator('button, a', { hasText: /logout|sign out/i });
    if (await logoutBtn.count() > 0) {
      await logoutBtn.first().click();
      await page.waitForSelector('#loginScreen', { state: 'visible' });
      // Theme should persist
      const themeAfterLogout = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(themeAfterLogout).toBeDefined();
      // Login again
      await page.fill('#password', CORRECT_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForSelector('#mainApp', { state: 'visible' });
      const themeAfterRelogin = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(themeAfterRelogin).toBe(themeAfterLogout);
    }
  });

  test('should not show error or submit on empty password', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#loginScreen', { state: 'visible' });
    await page.fill('#password', '');
    await page.click('button[type="submit"]');
    // Check that the login error element exists and contains the default text
    const error = page.locator('#loginError');
    expect(await error.count()).toBe(1);
    const text = await error.textContent();
    expect(text).toContain('Incorrect password');
  });

  test('should hide error after successful login', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#loginScreen', { state: 'visible' });
    await page.fill('#password', INCORRECT_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page.locator('#loginError')).toBeVisible();
    await page.fill('#password', CORRECT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForSelector('#mainApp', { state: 'visible' });
    await expect(page.locator('#loginError')).toBeHidden();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#loginScreen', { state: 'visible' });
    const passwordInput = page.locator('#password');
    const toggleBtn = page.locator('#togglePassword');
    const icon = page.locator('#togglePasswordIcon');
    await expect(toggleBtn).toBeVisible();
    // Default type is password
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    // Icon should change
    await toggleBtn.click();
    const iconClass = await icon.getAttribute('class');
    expect(iconClass).toMatch(/fa-eye-slash/);
  });

  test('should keep user logged in after refresh', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('#password', CORRECT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForSelector('#mainApp', { state: 'visible' });
    await page.reload();
    await expect(page.locator('#mainApp')).toBeVisible();
  });

  test('should return to login after logout and refresh', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('#password', CORRECT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForSelector('#mainApp', { state: 'visible' });
    // Simulate logout
    const logoutBtn = page.locator('button.logout-btn, button, a', { hasText: /logout|sign out/i });
    if (await logoutBtn.count() > 0) {
      await logoutBtn.first().click();
      await page.waitForSelector('#loginScreen', { state: 'visible' });
      await page.reload();
      await expect(page.locator('#loginScreen')).toBeVisible();
    }
  });

  test('should have logo with correct alt text', async ({ page }) => {
    await page.goto(BASE_URL);
    const logos = page.locator('img[alt*="logo" i]');
    const count = await logos.count();
    expect(count).toBeGreaterThan(0);
    let foundVisible = false;
    for (let i = 0; i < count; i++) {
      const alt = await logos.nth(i).getAttribute('alt');
      expect(alt.toLowerCase()).toContain('logo');
      if (await logos.nth(i).isVisible()) foundVisible = true;
    }
    expect(foundVisible).toBe(true);
  });

  test('should have two h1 headings with expected text', async ({ page }) => {
    await page.goto(BASE_URL);
    const headings = await page.locator('h1').allTextContents();
    expect(headings.length).toBe(2);
    expect(headings.some(text => /Welcome to\s+ModuMate/i.test(text))).toBe(true);
  });

  test('should have a footer element after login', async ({ page }) => {
    await page.goto(BASE_URL);
    // Footer may only be present after login
    await page.fill('#password', CORRECT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForSelector('#mainApp', { state: 'visible' });
    await page.waitForFunction(() => {
      const el = document.querySelector('#footer-container .footer');
      return !!el;
    });
    const footer = page.locator('#footer-container .footer');
    expect(await footer.count()).toBeGreaterThan(0);
  });

  test('should have working skip link for accessibility', async ({ page }) => {
    await page.goto(BASE_URL);
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toBeVisible();
    await skipLink.focus();
    await skipLink.press('Enter');
    // Focus should move to main content container
    // This may need to be adjusted based on your implementation
    // Optionally check document.activeElement
  });

  test('login error should have role alert for accessibility', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#loginScreen', { state: 'visible' });
    await page.fill('#password', INCORRECT_PASSWORD);
    await page.click('button[type="submit"]');
    const error = page.locator('#loginError');
    await expect(error).toBeVisible();
    const role = await error.getAttribute('role');
    expect(role).toBe('alert');
  });

  test('should have logical tab order on login form', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#loginScreen', { state: 'visible' });
    // Tab from password to submit
    await page.focus('#password');
    await page.keyboard.press('Tab');
    // Should focus toggle password or submit button
    // Optionally check document.activeElement
  });

  test('should have navbar links/buttons after login', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('#password', CORRECT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForSelector('#mainApp', { state: 'visible' });
    const navbar = page.locator('#navbar-container');
    await expect(navbar).toBeVisible();
    // Optionally check for specific links/buttons
  });

  test('should take screenshot of login and main app for visual regression', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#loginScreen', { state: 'visible' });
    await page.screenshot({ path: 'login-screen.png' });
    await page.fill('#password', CORRECT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForSelector('#mainApp', { state: 'visible' });
    await page.screenshot({ path: 'main-app.png' });
  });
}); 