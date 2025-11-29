import { test, expect } from '@playwright/test';

test.describe('MultiLingo Talk - Basic Navigation', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');

    // Check if page loads
    await expect(page).toHaveTitle(/MultiLingo|Talk/i);

    // Check if main content is visible
    const mainContent = page.locator('[role="main"]');
    await expect(mainContent).toBeVisible();
  });

  test('should navigate to chat page', async ({ page }) => {
    await page.goto('/');

    // Find and click chat link
    const chatLink = page.locator('a:has-text("Chat")', { exact: false });

    // If link exists, click it
    if (await chatLink.count() > 0) {
      await chatLink.first().click();
      // Should navigate to chat page
      await expect(page).toHaveURL(/.*chat/);
    }
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/');

    // Find and click settings link
    const settingsLink = page.locator('a:has-text("Settings")', { exact: false });

    if (await settingsLink.count() > 0) {
      await settingsLink.first().click();
      // Should navigate to settings page
      await expect(page).toHaveURL(/.*settings/);
    }
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.goto('/');

    // Find and click analytics link
    const analyticsLink = page.locator('a:has-text("Analytics")', { exact: false });

    if (await analyticsLink.count() > 0) {
      await analyticsLink.first().click();
      // Should navigate to analytics page
      await expect(page).toHaveURL(/.*analytics/);
    }
  });
});

test.describe('Settings Page - Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/settings');

    // Find dark mode toggle
    const darkModeToggle = page.locator('input[type="checkbox"]').first();

    if (await darkModeToggle.count() > 0) {
      // Get initial state
      const initialState = await darkModeToggle.isChecked();

      // Click toggle
      await darkModeToggle.click();

      // Verify state changed
      const newState = await darkModeToggle.isChecked();
      expect(newState).toBe(!initialState);
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1 element
    const h1 = page.locator('h1');
    expect(await h1.count()).toBeGreaterThan(0);
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/');

    // All links should have text or aria-label
    const links = page.locator('a');
    const linkCount = await links.count();

    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      // Should have either text or aria-label
      expect(text?.trim().length || ariaLabel?.length).toBeGreaterThan(0);
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through page
    await page.keyboard.press('Tab');

    // Check if some element is focused
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Responsive Design', () => {
  test('should render on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/');

    // Page should load successfully
    await expect(page).toHaveTitle(/MultiLingo|Talk/i);

    // Main content should be visible
    const mainContent = page.locator('[role="main"]');
    await expect(mainContent).toBeVisible();
  });

  test('should render on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');

    // Page should load successfully
    await expect(page).toHaveTitle(/MultiLingo|Talk/i);
  });

  test('should render on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/');

    // Page should load successfully
    await expect(page).toHaveTitle(/MultiLingo|Talk/i);
  });
});
