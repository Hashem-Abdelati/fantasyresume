import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("codex-hall-entered", "1");
    localStorage.setItem("codex-view", "simple");
  });
});

test("closing folds the current pages away and leaves no interactive duplicate", async ({
  page,
}, info) => {
  await page.goto("/projects");
  await expect(page.locator(".book-reader")).toHaveAttribute(
    "data-turning",
    "false",
  );
  await page.getByRole("link", { name: "Close book", exact: true }).click();
  await expect(page).toHaveURL(/\/hub$/);
  const departing = page.locator(".book-return-copy");
  await expect(departing).toHaveCount(1);
  await expect(departing).toHaveAttribute("aria-hidden", "true");
  await expect(departing).toHaveAttribute("inert", "");
  expect(await departing.locator("[id]").count()).toBe(0);
  expect(await departing.textContent()).toContain("Quest Log");
  if (info.project.name === "webkit") {
    await page.evaluate(() =>
      document.getAnimations().forEach((animation) => {
        const target = (animation.effect as KeyframeEffect)?.target;
        if (
          target instanceof HTMLElement &&
          target.closest(".book-return-copy")
        ) {
          animation.pause();
          animation.currentTime = 480;
        }
      }),
    );
    await page.screenshot({ path: "/private/tmp/book-closing-paper.png" });
    await page.evaluate(() =>
      document.getAnimations().forEach((animation) => animation.play()),
    );
  }
  await expect(departing).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveClass(/book-returning/);
  await expect(page.locator("#portfolio-content")).toBeFocused();
});

test("Escape, browser history and reopening cancel departing pages cleanly", async ({
  page,
}) => {
  await page.goto("/hub");
  await page.getByRole("link", { name: /Open Spellbook Codex/ }).click();
  await expect(page.locator(".book-reader")).toHaveAttribute(
    "data-turning",
    "false",
  );
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/hub$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator(".book-return-copy")).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.locator(".book-return-copy")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveClass(/book-returning/);
});

test("reduced motion returns directly without a folding overlay", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/experience");
  await page.getByRole("link", { name: "Close book", exact: true }).click();
  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.locator(".book-return-copy")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveClass(/book-returning/);
});
