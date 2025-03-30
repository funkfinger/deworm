import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should display the cookie consent banner", async ({ page }) => {
    await page.goto("/");

    // Cookie consent should be visible
    const cookieConsent = page.getByText("Cookie Policy");
    await expect(cookieConsent).toBeVisible();

    // Accept button should be present
    const acceptButton = page.getByRole("button", { name: "Accept" });
    await expect(acceptButton).toBeVisible();

    // Clicking accept should hide the banner
    await acceptButton.click();
    await expect(cookieConsent).not.toBeVisible();
  });

  test("should have proper metadata", async ({ page }) => {
    await page.goto("/");

    // Check title
    await expect(page).toHaveTitle(/DeWorm - Earworm Cure App/);
  });
});
