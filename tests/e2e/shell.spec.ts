import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("keeps the shell keyboard-accessible without horizontal overflow at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ativar modo escuro" }),
  ).toBeVisible();

  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", {
    name: "Pular para o conteúdo principal",
  });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();

  await page.goto("/");
  const themeToggle = page.getByRole("button", {
    name: "Ativar modo escuro",
  });
  await expect(themeToggle).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(themeToggle).toBeFocused();
  await page.keyboard.press("Tab");

  const navigationControl = page.locator("summary");
  await expect(navigationControl).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.locator("details")).toHaveAttribute("open", "");
  await expect(page.getByRole("link", { name: "Visão geral" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Governança" })).toBeDisabled();
});

test("has no serious or critical accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();
  const blockingViolations = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );

  expect(blockingViolations).toEqual([]);
});

test("keeps the frame within the supported viewport widths", async ({
  page,
}) => {
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto("/");

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }
});
