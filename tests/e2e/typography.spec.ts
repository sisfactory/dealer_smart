import { expect, test } from "@playwright/test";

test("uses the canonical typography at mobile and desktop widths", async ({
  page,
}) => {
  for (const [width, headingSize, headingLineHeight] of [
    [320, "24px", "32px"],
    [1280, "32px", "40px"],
  ] as const) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto("/");

    const typography = await page.evaluate(() => {
      const main = document.querySelector("main");
      const heading = main?.querySelector("h1");
      const introduction = main?.querySelector("p");
      const cardHeading = main?.querySelector("h2");
      const cardBody = main?.querySelector("article > div");
      const navigation = document.querySelector(
        window.innerWidth < 640 ? "summary" : "nav a",
      );

      if (
        !heading ||
        !introduction ||
        !cardHeading ||
        !cardBody ||
        !navigation
      ) {
        throw new Error("Required shell typography is missing");
      }

      const style = (element: Element) => {
        const computed = getComputedStyle(element);
        return {
          family: computed.fontFamily,
          size: computed.fontSize,
          lineHeight: computed.lineHeight,
        };
      };

      return {
        heading: style(heading),
        introduction: style(introduction),
        cardHeading: style(cardHeading),
        cardBody: style(cardBody),
        navigation: style(navigation),
      };
    });

    expect(typography.heading).toMatchObject({
      size: headingSize,
      lineHeight: headingLineHeight,
    });
    expect(typography.heading.family).toContain("Outfit");
    expect(typography.introduction).toMatchObject({
      size: "15px",
      lineHeight: "24px",
    });
    expect(typography.introduction.family).toContain("Plus Jakarta Sans");
    expect(typography.cardHeading).toMatchObject({
      size: "16px",
      lineHeight: "24px",
    });
    expect(typography.cardBody).toMatchObject({
      size: "15px",
      lineHeight: "24px",
    });
    expect(typography.navigation).toMatchObject({
      size: "14px",
      lineHeight: "20px",
    });
    expect(typography.navigation.family).toContain("Plus Jakarta Sans");
  }
});
