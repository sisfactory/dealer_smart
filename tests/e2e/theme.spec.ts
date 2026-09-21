import { expect, test } from "@playwright/test";

test("persists the selected color theme and applies the canonical body font", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  const themeToggle = page.getByRole("button", {
    name: /ativar modo escuro/i,
  });

  await page.locator("body").evaluate((element) => {
    element.style.fontFamily = "monospace";
  });
  expect(
    await themeToggle.evaluate((element) => {
      return getComputedStyle(element).fontFamily;
    }),
  ).toContain("Plus Jakarta Sans");

  await themeToggle.click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(
    await page.locator("body").evaluate((element) => {
      return getComputedStyle(element).fontFamily;
    }),
  ).toContain("Plus Jakarta Sans");
});
