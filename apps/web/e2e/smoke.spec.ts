import { test, expect } from "@playwright/test";

test("landing page loads with hero headline", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Fund Ideas Without Middlemen/i })).toBeVisible();
});

test("campaigns page shows campaign grid", async ({ page }) => {
  await page.goto("/campaigns");
  await expect(page.getByRole("heading", { name: /^Campaigns$/i })).toBeVisible();
});

test("create campaign page has form", async ({ page }) => {
  await page.goto("/campaigns/create");
  await expect(page.getByLabel(/Title/i)).toBeVisible();
});

test("navigation links work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Explore Campaigns/i }).first().click();
  await expect(page).toHaveURL(/campaigns/);
});
