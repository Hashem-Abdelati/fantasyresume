import { JOURNAL_ENABLED } from "../src/data/journal";
import { test, expect } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { scryptSync } from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
let server: ChildProcess, dir: string, origin: string;
test.skip(!JOURNAL_ENABLED, "Journal editor is parked for now.");
test.beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "codex-journal-ui-"));
  server = spawn(process.execPath, ["tests/helpers/journal-server.mjs"], {
    env: {
      ...process.env,
      JOURNAL_DATA_FILE: join(dir, "entries.json"),
      JOURNAL_PASSWORD_HASH: `test-salt:${scryptSync("test-only-spell", "test-salt", 32).toString("hex")}`,
      JOURNAL_SESSION_SECRET: "test-browser-secret-with-at-least-32-characters",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  origin = await new Promise<string>((resolve, reject) => {
    let output = "";
    server.stdout!.on("data", (chunk) => {
      output += chunk;
      const port = output.match(/JOURNAL_TEST_PORT=(\d+)/);
      if (port) resolve(`http://127.0.0.1:${port[1]}`);
    });
    server.stderr!.on("data", (chunk) => {
      output += chunk;
    });
    server.once("error", reject);
    server.once("exit", () => reject(new Error(output)));
  });
});
test.afterAll(async () => {
  if (server && server.exitCode === null) {
    const stopped = new Promise<void>((resolve) =>
      server.once("exit", () => resolve()),
    );
    server.kill("SIGTERM");
    await stopped;
  }
  if (dir) await rm(dir, { recursive: true, force: true });
});

test("keeper can draft, publish, edit, back up and unpublish without exposing drafts to visitors", async ({
  page,
  browser,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin + "/inventory");
  await page.getByRole("button", { name: "Open master spell" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: "Unlock journal" }),
  ).toBeEnabled();
  await dialog
    .getByLabel("Master spell", { exact: true })
    .fill("test-only-spell");
  await dialog.getByRole("button", { name: "Unlock journal" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Journal editor" }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${info.project.name}-journal-unlocked.png`,
  });
  expect(
    await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBe(true);
  await dialog
    .getByLabel("Title", { exact: true })
    .pressSequentially("A night in the old library");
  await expect(dialog.getByLabel("Title", { exact: true })).toHaveValue(
    "A night in the old library",
  );
  await dialog
    .getByLabel("Short description")
    .fill("Notes from a new adventure.");
  await dialog
    .getByLabel("Journal entry", { exact: true })
    .fill("First paragraph.\n\n<script>window.journalInjected=true</script>");
  await dialog
    .getByRole("button", { name: "Save private draft", exact: true })
    .click();
  await expect(dialog.getByRole("status")).toHaveText("Private draft saved.");
  expect(
    (await (await page.request.get(origin + "/api/journal")).json()).entries,
  ).toEqual([]);
  await page.reload();
  await page.getByRole("button", { name: "Open master spell" }).click();
  await dialog
    .getByRole("navigation", { name: "Journal entries" })
    .getByRole("button", { name: /A night in the old library/ })
    .click();
  await expect(dialog.getByLabel("Journal entry", { exact: true })).toHaveValue(
    "First paragraph.\n\n<script>window.journalInjected=true</script>",
  );
  await dialog
    .getByRole("button", { name: "Preview entry", exact: true })
    .click();
  await expect(dialog.locator(".journal-preview")).toContainText("<script>");
  expect(await page.evaluate(() => "journalInjected" in window)).toBe(false);
  await page.screenshot({
    path: `test-results/${info.project.name}-journal-editor.png`,
    fullPage: true,
  });
  const downloadEvent = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Backup", exact: true }).click();
  expect((await downloadEvent).suggestedFilename()).toBe(
    "codex-journal-backup.json",
  );
  await dialog
    .getByRole("button", { name: "Publish entry", exact: true })
    .click();
  await expect(dialog.getByRole("status")).toContainText("Published");
  const visitor = await browser.newContext({ reducedMotion: "reduce" });
  const other = await visitor.newPage();
  try {
    await other.goto(origin + "/inventory");
    await other
      .getByRole("button", { name: /A night in the old library/ })
      .click();
    await expect(other.getByRole("dialog")).toContainText("First paragraph.");
    await page.bringToFront();
    await dialog
      .getByLabel("Journal entry", { exact: true })
      .fill("Revised and published story.");
    await dialog
      .getByRole("button", { name: "Publish changes", exact: true })
      .click();
    await expect(dialog.getByRole("status")).toContainText("Published");
    await other.reload();
    await expect(other.getByRole("dialog")).toContainText(
      "Revised and published story.",
    );
    await dialog
      .getByRole("button", { name: "Return to private draft", exact: true })
      .click();
    await expect(dialog.getByRole("status")).toHaveText("Private draft saved.");
    await other.goto(origin + "/inventory");
    await expect(
      other.getByRole("button", { name: /A night in the old library/ }),
    ).toHaveCount(0);
    await dialog.getByRole("button", { name: "Lock", exact: true }).click();
    await expect(
      dialog.getByRole("button", { name: "Unlock journal" }),
    ).toBeVisible();
    expect(
      (await page.request.get(origin + "/api/journal?owner=1")).status(),
    ).toBe(401);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    expect(errors).toEqual([]);
  } finally {
    await visitor.close();
  }
});
