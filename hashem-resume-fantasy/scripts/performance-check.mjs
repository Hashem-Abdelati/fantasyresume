import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:5173/hub");
await page.locator("canvas").waitFor();
await page
  .getByText("Opening the Codex…", { exact: true })
  .waitFor({ state: "hidden" });
await page.waitForFunction(() => document.querySelector("canvas")?.dataset.fps);
const before = await page.locator("canvas").evaluate((c) => ({ ...c.dataset }));
for (const path of [
  "/about",
  "/projects",
  "/experience",
  "/inventory",
  "/contact",
  "/hub",
]) {
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .locator(`a[href="${path}"]`)
    .click();
}
await page.waitForTimeout(2500);
const after = await page.locator("canvas").evaluate((c) => ({ ...c.dataset }));
const resources = await page.evaluate(() =>
  performance
    .getEntriesByType("resource")
    .filter((r) => r.name.includes("/models/"))
    .map((r) => ({
      url: r.name.split("/").pop(),
      bytes: r.transferSize,
      durationMs: Math.round(r.duration),
    })),
);
const report = {
  browser: "Installed Google Chrome, headless, 1440×900; development server",
  before,
  after,
  resources,
  errors,
};
await writeFile("docs/performance.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
