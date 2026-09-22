import { expect, test } from "@playwright/test";

test("renders the foundation", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Dealer Smart" }),
  ).toBeVisible();
});
