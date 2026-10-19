import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:5173/hub");
await page
  .getByText("Opening the Codex…", { exact: true })
  .waitFor({ state: "hidden" });
await page.locator("canvas").click({ position: { x: 385, y: 450 } });
await page.waitForURL("**/inventory");
await page.waitForTimeout(1600);
await page.locator("canvas").click({ position: { x: 289, y: 305 } });

console.log("Artifact URL:", page.url());
await page.getByRole("dialog").waitFor();
await page.screenshot({ path: "/private/tmp/codex-diary-final.png" });
console.log("Physical satchel and raised artifact card: passed");
await page.keyboard.press("Escape");
await page.getByRole("dialog").waitFor({ state: "hidden" });
await page.keyboard.press("Escape");
console.log("After Escape:", page.url());
await page.waitForURL("**/hub", { timeout: 10000 });
await page.waitForTimeout(1600);
await page.locator("canvas").click({ position: { x: 1055, y: 430 } });
console.log("After Raven click:", page.url());
await page.screenshot({ path: "/private/tmp/codex-raven-click.png" });
await page.waitForURL("**/contact", { timeout: 10000 });
await page.getByLabel("Your Name").waitFor();
console.log("Physical raven entrance: passed");
await browser.close();
