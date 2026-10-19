import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("book opens into viewport pages, turns both ways, and settles after rapid navigation", async ({
  page,
  isMobile,
}, info) => {
  await page.goto("/hub");
  await page.getByRole("link", { name: /Open Spellbook Codex/ }).click();
  const reader = page.locator(".book-reader");
  await expect(page.locator(".book-spread .folio-page")).toHaveCount(2);
  await expect(page.locator(".reading-panel")).toHaveCount(0);
  await expect(reader).toHaveAttribute("data-turning", "false");
  if (!isMobile) {
    const box = await reader.boundingBox();
    expect(box!.width).toBeGreaterThan(1300);
    expect(box!.y + box!.height).toBeLessThanOrEqual(901);
  }
  const chapters = page.getByRole("navigation", { name: "Codex chapters" });
  await chapters.getByRole("link", { name: /Quests/ }).click();
  if (!isMobile) {
    await expect(reader).toHaveAttribute("data-turning", "true");
    expect(await page.locator(".leaf-front").textContent()).toContain(
      "Traits & mastery",
    );
    expect(await page.locator(".leaf-back").textContent()).toContain(
      "Quest Log",
    );
    await page.evaluate(() => {
      for (const animation of document.getAnimations()) {
        if (
          (animation.effect as KeyframeEffect)?.target instanceof HTMLElement &&
          (
            (animation.effect as KeyframeEffect).target as HTMLElement
          ).classList.contains("turning-leaf")
        ) {
          animation.pause();
          animation.currentTime = 390;
        }
      }
    });
    await page.screenshot({
      path: `test-results/${info.project.name}-page-turn.png`,
    });
    await page.evaluate(() =>
      document.getAnimations().forEach((animation) => animation.play()),
    );
  }
  await expect(reader).toHaveAttribute("data-turning", "false");
  await chapters.getByRole("link", { name: /Character/ }).click();
  await chapters.getByRole("link", { name: /Journey/ }).click();
  await chapters.getByRole("link", { name: /Quests/ }).click();
  await expect(reader).toHaveAttribute("data-turning", "false");
  await expect(page.locator(".book-turn-layer")).toBeEmpty();
  await expect(page.locator(".book-spread h1")).toHaveText("Quest Log");
  await page
    .getByRole("button", {
      name: "Open Quest: Deep Learning for Building Footprint Segmentation",
      exact: true,
    })
    .click();
  await expect(page.locator(".book-spread #quest-title")).toHaveText(
    "Deep Learning for Building Footprint Segmentation",
  );
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const paper = page
    .locator(".book-spread")
    .getByRole("link", { name: "Read the paper" });
  await paper.scrollIntoViewIfNeeded();
  await expect(paper).toHaveAttribute(
    "href",
    "/csci_4364_6364_F2025_SkyMapper.pdf",
  );
  await page.getByRole("link", { name: "Close book", exact: true }).click();
  await expect(page).toHaveURL(/\/hub$/);
});

test("reduced motion book keeps all content reachable and accessible", async ({
  page,
  isMobile,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("codex-view", "simple"));
  await page.goto("/about");
  await expect(page.locator(".book-reader")).toHaveAttribute(
    "data-turning",
    "false",
  );
  await expect(page.locator(".book-turn-layer")).toBeEmpty();
  await page
    .locator(".book-spread")
    .getByText("Git/GitHub", { exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.locator(".book-spread").getByText("Git/GitHub", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Codex chapters" })
    .getByRole("link", { name: /Journey/ })
    .click();
  await page
    .getByRole("button", {
      name: "Read Full-Stack Engineering Intern at Mawdoo3",
    })
    .click();
  await expect(page.locator(".book-spread #experience-title")).toHaveText(
    "Full-Stack Engineering Intern",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBeTruthy();
  const axe = await new AxeBuilder({ page })
    .include(".book-reader")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    axe.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page
    .getByRole("navigation", { name: "Codex chapters" })
    .getByRole("link", { name: /Character/ })
    .click();
  await page.screenshot({
    path: `test-results/${info.project.name}-open-book.png`,
    fullPage: isMobile,
  });
});
