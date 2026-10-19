import { test, expect } from "@playwright/test";

test("raven greeting is keyboard accessible and message cues contain no form data", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const cues: unknown[] = [];
    Object.assign(window, { ravenCues: cues });
    window.addEventListener("codex:raven-gesture", (event) =>
      cues.push((event as CustomEvent).detail),
    );
  });
  await page.goto("/contact");
  const call = page.getByRole("button", { name: "Call the raven" });
  if (!isMobile) {
    await expect(call).toBeVisible();
    await call.focus();
    await page.keyboard.press("Enter");
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window as Window & { ravenCues: unknown[] }).ravenCues.includes(
            "greet",
          ),
        ),
      )
      .toBe(true);
  } else await expect(call).toHaveCount(0);
  await page.getByLabel("Your Name").fill("Local animation check");
  await page.getByLabel("Your Email").fill("preview@example.com");
  await page
    .getByLabel("Message Scroll")
    .fill("This is a local draft check. No message is sent.");
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as Window & { ravenCues: unknown[] }).ravenCues.includes(
          "attend",
        ),
      ),
    )
    .toBe(true);
  // Abort any external protocol request: this test only prepares the local draft UI.
  await page.route(/^mailto:/, (route) => route.abort());
  await page.getByRole("button", { name: "Seal & Send Raven" }).click();
  await expect(page.getByRole("status")).toContainText("MESSAGE PREPARED");
  const draft = page.getByRole("link", { name: "Open Raven Link" });
  const href = await draft.getAttribute("href");
  expect(href).toContain("mailto:abdelatihashem@gmail.com?");
  expect(decodeURIComponent(href!)).toContain(
    "This is a local draft check. No message is sent.",
  );
  const cues = await page.evaluate(
    () => (window as Window & { ravenCues: unknown[] }).ravenCues,
  );
  expect(cues).toContain("prepare");
  expect(
    cues.every((cue) => ["greet", "attend", "prepare"].includes(String(cue))),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/hub$/);
  expect(errors).toEqual([]);
});

test("reduced motion and illustrated contact remain usable without gesture controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  await expect(
    page.getByRole("button", { name: "Call the raven" }),
  ).toHaveCount(0);
  await expect(page.getByLabel("Your Name")).toBeVisible();
  await expect(page.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/hashem-abdelati/",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
