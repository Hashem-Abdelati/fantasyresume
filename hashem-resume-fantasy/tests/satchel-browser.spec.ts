import { test, expect } from "@playwright/test";

test("open satchel exposes four separately clickable cards and returns cleanly to the hall", async ({
  page,
  isMobile,
}, info) => {
  test.skip(
    isMobile,
    "Physical card picking is desktop; mobile uses the inventory controls.",
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/inventory");
  await expect(page.locator("canvas")).toBeVisible();
  await expect(
    page.getByText("Opening the Codex…", { exact: true }),
  ).toHaveCount(0);
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: `test-results/${info.project.name}-satchel-open.png`,
  });
  const cards = [
    { x: 195, y: 407, id: "my-life", name: "More About Me" },
    { x: 289, y: 379, id: "career-goals", name: "Career Goals" },
    { x: 375, y: 363, id: "touching-grass", name: "Touching Grass" },
    { x: 455, y: 365, id: "watching-movies", name: "Watching Movies" },
  ];
  for (const card of cards) {
    await page.mouse.click(card.x, card.y);
    await expect(page).toHaveURL(new RegExp(`artifact=${card.id}`));
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page
        .getByRole("dialog")
        .getByRole("heading", { name: card.name, exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/hub$/);
  await page.waitForTimeout(1700);
  await page.getByRole("link", { name: /Open Satchel Inventory/ }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Grand Hall", exact: true })
    .click();
  await page.getByRole("link", { name: /Open Satchel Inventory/ }).click();
  await page.waitForTimeout(2000);
  await page.mouse.click(289, 379);
  await expect(page).toHaveURL(/artifact=career-goals/);
  expect(errors).toEqual([]);
});
