import { test, expect } from "@playwright/test";

for (const [label, path, stage] of [
  ["Satchel Inventory", "/inventory", "satchel"],
  ["Raven Contact", "/contact", "raven"],
] as const) {
  test(`${label} approaches smoothly and dismisses its panel without stale controls`, async ({
    page,
  }) => {
    await page.addInitScript(() =>
      sessionStorage.setItem("codex-hall-entered", "1"),
    );
    await page.goto("/hub");
    const bounds = (await page.locator("canvas").count())
      ? await page.locator("canvas").boundingBox()
      : null;
    await page.getByRole("link", { name: new RegExp(`Open ${label}`) }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    const panel = page.locator(".artifact-chapter .reading-panel");
    await expect(panel).toBeVisible();
    await expect
      .poll(() =>
        panel.evaluate((node) => Number(getComputedStyle(node).opacity)),
      )
      .toBe(1);
    if (bounds)
      expect(await page.locator("canvas").boundingBox()).toEqual(bounds);
    await page
      .getByRole("link", { name: "Close and return to Grand Hall" })
      .click();
    await expect(page).toHaveURL(/\/hub$/);
    const outgoing = page.locator(
      `.artifact-departure[data-artifact="${stage}"]`,
    );
    await expect(outgoing).toHaveAttribute("inert", "");
    await expect(outgoing).toHaveAttribute("aria-hidden", "true");
    expect(await outgoing.locator("[id]").count()).toBe(0);
    await expect(outgoing).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveClass(/artifact-returning/);
    await expect(page.locator("#portfolio-content")).toBeFocused();
  });
}

test("artifact switching and rapid history leave no duplicate panels", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("codex-view", "simple"));
  await page.goto("/inventory");
  await page
    .getByRole("link", { name: "Close and return to Grand Hall" })
    .click();
  await page.getByRole("link", { name: /Open Raven Contact/ }).click();
  await expect(page.getByLabel("Your Name", { exact: true })).toBeVisible();
  await page.goBack();
  await page.goBack();
  await expect(page).toHaveURL(/\/inventory$/);
  await expect(page.locator(".artifact-departure")).toHaveCount(0);
  await expect(page.locator(".artifact-chapter .reading-panel")).toHaveCount(1);
});

test("reduced motion skips artifact travel and exit copies", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  await expect(page.getByLabel("Your Name", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.locator(".artifact-departure")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveClass(/artifact-returning/);
});
