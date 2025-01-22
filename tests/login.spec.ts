import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("successful login", async ({ page }) => {
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Wait for dashboard redirect
    await expect(page).toHaveURL("/dashboard");
  });

  test("shows error with invalid credentials", async ({ page }) => {
    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "wrongpass");
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator(".MuiAlert-root")).toBeVisible();
  });

  test("navigates to signup page", async ({ page }) => {
    await page.click("text=Don't have an account? Sign Up");
    await expect(page).toHaveURL("/signup");
  });
});
