import { test, expect } from "@playwright/test";

test("first visit opens the doors, enters the hall, and never replays on return or refresh", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const doorResponse = page.waitForResponse((response) =>
    response.url().endsWith("/models/doors.glb"),
  );
  await page.goto("/");
  expect((await doorResponse).ok()).toBe(true);
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator(".hall-door, .door-frame")).toHaveCount(0);
  const entrance = page.getByRole("dialog", {
    name: "Entering the Grand Hall",
  });
  await expect(entrance).toBeVisible();
  await expect(page.locator(".codex-world")).toHaveAttribute("inert", "");
  await expect(
    page.getByRole("button", { name: "Skip entrance" }),
  ).toBeFocused();
  await expect(entrance).toHaveClass(/is-ready/);
  const canvas = await page.locator("canvas").elementHandle();
  const entryBounds = await page.locator("canvas").boundingBox();
  await expect(entrance).toHaveCount(0, { timeout: 25000 });
  await expect(page).toHaveURL(/\/hub$/);
  // Arriving must not resize or replace the physical room (including on phones).
  expect(await page.locator("canvas").boundingBox()).toEqual(entryBounds);
  expect(
    await canvas!.evaluate((node) => node === document.querySelector("canvas")),
  ).toBe(true);
  await expect(page.locator("#portfolio-content")).toBeFocused();
  await page.getByRole("link", { name: /Open Raven Contact/ }).click();
  await expect(page.getByLabel("Your Name")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/hub$/);
  await expect(entrance).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /More than a resume/ }),
  ).toBeVisible();
  await expect(entrance).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("physical entrance can be skipped immediately with keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Skip entrance" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.locator(".codex-world")).not.toHaveAttribute("inert", "");
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
  await expect(
    page.getByRole("link", { name: /Open Spellbook Codex/ }),
  ).toBeVisible();
});

test("deep links and reduced motion bypass the entrance", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByLabel("Your Name")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.evaluate(() => sessionStorage.removeItem("codex-hall-entered"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /More than a resume/ }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("unavailable doorway and illustrated mode never block the hall", async ({
  page,
}) => {
  await page.route("**/models/doors.glb", (route) => route.abort());
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /More than a resume/ }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.setItem("codex-view", "simple");
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /More than a resume/ }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
