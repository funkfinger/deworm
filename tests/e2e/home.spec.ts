import { test, expect } from "@playwright/test";

test("homepage has correct title and content", async ({ page }) => {
  await page.goto("/");

  // Check page title
  await expect(page).toHaveTitle(/DeWorm/);

  // Check heading
  const heading = page.getByRole("heading", { name: "Welcome to DeWorm" });
  await expect(heading).toBeVisible();

  // Check intro text
  await expect(page.getByText(/An app to help cure earworms/)).toBeVisible();

  // Check disabled login button
  const loginButton = page.getByRole("button", { name: /login with spotify/i });
  await expect(loginButton).toBeVisible();
  await expect(loginButton).toBeDisabled();
});
