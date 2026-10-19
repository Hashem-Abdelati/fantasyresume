import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("routes, chapters, dossiers, diary, contact and back navigation", async ({
  page,
  isMobile,
}) => {
  // The entrance has its own suite; this case covers the visitor flow after arrival.
  await page.addInitScript(() =>
    sessionStorage.setItem("codex-hall-entered", "1"),
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/hub");
  await expect(
    page.getByRole("heading", { name: /More than a resume/ }),
  ).toBeVisible();
  const navigate = async (name: string) => {
    if (isMobile)
      await page
        .getByRole("button", { name: "Open navigation", exact: true })
        .click();
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: new RegExp(`^${name}`) })
      .click();
  };
  await page.getByRole("link", { name: /Open Spellbook Codex/ }).click();
  await expect(
    page.locator(".book-spread").getByText("Aspiring Software/Data Engineer"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Codex of Mastery" }),
  ).toBeVisible();
  await expect(page.locator(".book-spread .folio-page")).toHaveCount(2);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/about$/);
  await page
    .getByRole("navigation", { name: "Codex chapters" })
    .getByRole("link", { name: /Quests/ })
    .click();
  await page
    .getByRole("button", { name: "Open Quest: GlycosOS", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.locator(".book-spread .folio-right").getByText(/WHOOP/),
  ).toBeAttached();
  await page
    .getByRole("navigation", { name: "Codex chapters" })
    .getByRole("link", { name: /Journey/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Machine Learning Intern" }),
  ).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/projects(?:\?|$)/);
  await page.goForward();
  await expect(page).toHaveURL(/\/experience$/);
  await page.reload();
  await expect(
    page.getByText("LigaData", { exact: false }).first(),
  ).toBeVisible();
  await navigate("Inventory");
  await page.getByRole("button", { name: "Open More About Me" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByText(/mujadara/)).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open Touching Grass" }).click();
  await expect(page.getByRole("dialog").locator("img").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await navigate("Raven");
  await expect(page.getByLabel("Your Name")).toBeVisible();
  await expect(page.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/hashem-abdelati/",
  );
  await expect(
    page.getByRole("link", { name: /Email abdelati/ }),
  ).toHaveAttribute("href", "mailto:abdelatihashem@gmail.com");
  await page.getByLabel("Your Name").fill("Portfolio QA");
  await page.getByLabel("Your Email").fill("qa@example.com");
  await page.getByLabel("Message Scroll").fill("Draft verification only.");
  // No mail application is launched and no message is sent.
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/hub$/);
  expect(errors).toEqual([]);
});
test("direct aliases, responsive layout and accessible fallback", async ({
  page,
  isMobile,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [path, expected] of [
    ["/character", "/about"],
    ["/quests", "/projects"],
    ["/journey", "/experience"],
    ["/raven", "/contact"],
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(expected + "$"));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
  }
  await page.goto("/inventory?artifact=career-goals");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() =>
      document
        .querySelector('[role="dialog"]')
        ?.contains(document.activeElement),
    ),
  ).toBeTruthy();
  await page.keyboard.press("Escape");
  await page.goto("/hub");
  if (!isMobile)
    await page.getByRole("button", { name: "Reading mode" }).click();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".artifact-link img")).toHaveCount(3);
  await page.screenshot({
    path: `test-results/${info.project.name}-hall.png`,
    fullPage: true,
  });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
test("WebGL unavailable and model failure preserve useful content", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Mobile defaults to the illustrated navigation.");
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "Quest Log" })).toBeVisible();
  await expect(page.locator(".simple-view")).toBeVisible();
});
test("3D assets load, physical book is clickable, failed assets and slow loading degrade gracefully", async ({
  page,
  isMobile,
}, info) => {
  test.skip(
    isMobile,
    "Desktop 3D interaction test; mobile has independent illustrated controls.",
  );
  const failures: string[] = [];
  page.on("pageerror", (e) => failures.push(e.message));
  await page.goto("/hub");
  await expect(page.locator("canvas")).toBeVisible();
  await expect(
    page.getByText("Opening the Codex…", { exact: true }),
  ).toHaveCount(0, { timeout: 20000 });
  await page.screenshot({
    path: `test-results/${info.project.name}-3d-hall.png`,
  });
  // The fixed camera places the book at the center of the stage.
  await page.locator("canvas").click({ position: { x: 720, y: 410 } });
  await expect(page).toHaveURL(/\/about$/);
  await expect(
    page.locator(".book-spread").getByText("Aspiring Software/Data Engineer"),
  ).toBeVisible();
  await page.waitForTimeout(1600);
  await page.screenshot({
    path: `test-results/${info.project.name}-3d-book.png`,
  });
  expect(failures).toEqual([]);
});
test("failed raven model and delayed scene retain immediate portfolio navigation", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Mobile does not request GLBs by default.");
  await page.route("**/models/raven.glb", (route) => route.abort());
  await page.goto("/hub");
  await expect(
    page.getByRole("link", { name: /Open Spellbook Codex/ }),
  ).toBeVisible();
  await expect(page.locator(".simple-view")).toBeVisible();
  await page.getByRole("link", { name: /Open Spellbook Codex/ }).click();
  await expect(
    page.locator(".book-spread").getByText("Aspiring Software/Data Engineer"),
  ).toBeVisible();
  await page.unroute("**/models/raven.glb");
  await page.route("**/models/*.glb", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2200));
    await route.continue();
  });
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "Quest Log" })).toBeVisible();
  await page
    .getByRole("button", { name: "Open Quest: GlycosOS", exact: true })
    .click();
  await expect(page.locator(".book-spread #quest-title")).toHaveText(
    "GlycosOS",
  );
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
