# Verification record

The portfolio preserves its existing React content behind a route-driven 3D navigation layer. No contact message was sent and no production deployment was performed.

## Automated coverage

Initial implementation: 19 passing checks across desktop Chromium, Firefox, WebKit, iPhone 13 viewport/WebKit, and Pixel 7 viewport/Chromium. Six desktop-only 3D tests are intentionally skipped for the two mobile projects, which default to illustrated navigation.

Verified routes and alias redirects, browser back/forward and refresh, preserved Character content and skill tree, project dossiers, experience timeline, diary content and images, contact links and labeled fields, Escape behavior, focus trapping, mobile overflow, reduced motion, illustrated-view accessibility, actual 3D book clicks, WebGL unavailability, failed raven model and delayed model loading. Axe reports no WCAG A/AA violations in the illustrated Hall under these tests. This is targeted automation, not a claim of a complete accessibility certification.

After moving dialogs into body portals, all five browser/device visitor-flow checks passed again. A separate installed-Chrome smoke check confirmed direct satchel clicks, selection of a raised Career Goals card, Escape return to Hall, and direct raven clicks.

`npm run build` and `npm run lint` pass. See `tests/portfolio.spec.ts` for executable checks. Console exceptions are asserted absent in normal visitor flows. The current Three.js version emits an upstream Clock deprecation warning in development; it does not affect navigation.

## Rendering and payload

All three optimized GLBs together are approximately 1.25 MB; their WebP poster equivalents together are approximately 100 KB. The 3D renderer is lazy-loaded (about 289 KB gzip), and the core content bundle is about 96 KB gzip. The renderer caps DPR at 1.5, lowers it under sustained poor performance, stops drawing in background tabs, and renders on demand under reduced motion. One 1024px shadow map is used.

Measured on this Mac with installed Google Chrome in headless mode at 1440×900: approximately 61 FPS at rest and 41 FPS during a burst of route changes. Texture count remained at 11. These measurements precede the full-screen book refinement; the former extra page-turn geometry has since been removed, and the scene now pauses while the book is open. These are local development measurements, not mobile hardware or field Core Web Vitals. Full raw data: `docs/performance.json`.

## Boundaries

WebKit passes the Safari-engine suite. Native Safari UI inspection was attempted but macOS Computer Use permissions were unavailable. Physical iPhone/Android hardware was not tested; mobile results are viewport/browser emulation. The live website remains unchanged. Source content, dates and professional claims are preserved from the repository, not independently fact-checked.

## Full-screen book and readability refinement — September 15, 2026

Final suite: **29 passed, 6 intentional mobile skips** across Chromium, Firefox, WebKit, iPhone and Android emulation. `npm run build` and `npm run lint` pass. New coverage verifies viewport-sized leaves, forward/reverse turns with actual text, rapid navigation cleanup, inline project/experience selection, scroll access to all skills, direct query selection, reduced motion and accessible book content. Axe finds no WCAG A/AA violations in the tested book view. Mid-turn screenshots were reviewed to fix backface mirroring before the final run.

The initial Chromium test delay was traced to the page load wait; the final implementation bundles the existing fonts locally and the complete suite passes. The final type treatment uses clearer body text, greater contrast, larger labels and explicit overflow hints. Desktop and phone screenshots were inspected. Detailed test artifacts are generated under `test-results/` by the suite; no production deployment was made.

## Satchel refinement — September 15, 2026

The expanded suite completed with 33 passing checks and 12 intentional project skips. Two Chromium cases exceeded the initial 45-second budget under concurrent rendering load; both passed when rerun with one worker and a 90-second budget. The satchel geometry check samples opening, closing, and interrupted transitions against the exported mesh: cards remain separated, avoid the bag/flap triangles, and return to their stored positions. Desktop physical card selection passed in Chromium, Firefox, and WebKit. Closed/open Blender renders and desktop views at 1440 and 1024 pixels were inspected. Build and lint passed.

## Enchanted raven — September 15, 2026

Build, lint, and diff whitespace checks pass. Ten new raven/contact checks pass across Chromium, Firefox, WebKit, iPhone and Android emulation. They verify keyboard greeting, focus/preparation cues, cue payloads containing no private form data, the mailto draft and explicit prepared state, reduced-motion controls, mobile overflow, and Escape return. External protocol requests are aborted during the draft test; no message is sent.

The main visitor flow and failed/delayed raven-model fallback checks pass again: eight checks passed with two intentional mobile skips. Installed-Chrome smoke verification also confirms physical satchel/card selection and clicking the revised raven to enter Contact. Rest and mid-greeting views were inspected at 1440×900, and the stage was checked at 1024×768. The aspect-aware camera keeps room for the wings and caption. These checks do not represent a production deployment or physical phone testing.

## Textured doorway and continuous Hall — 2026-09-21

Build, lint and diff whitespace checks pass. The final targeted regression run has **24 passed and 6 intentional skips** across Chromium, Firefox, WebKit, iPhone/WebKit and Android/Chromium emulation. It covers first-visit entry, stable canvas dimensions and identity across arrival (including phones), no replay on return/reload, keyboard skip and focus restoration, deep links, reduced motion, missing doorway, illustrated mode, threshold clearance and physical book selection. The pure motion check runs once; physical mesh selection runs on desktop only.

Closed, mid-walk and settled views were inspected with a controlled browser clock. The doors now use baked color, normal and roughness maps for oak, basalt, iron and bronze; exported GLB materials were checked for all three texture slots. The same room, camera viewport and lighting remain through arrival, with a gradual interface reveal. The doorway has no H crest. These are local browser/emulated-device checks; no production deployment or physical-phone performance claim is implied.

## Book and artifact handoffs — 2026-09-21

The book transition suite passes **25 checks** across Chromium, Firefox, WebKit, iPhone and Android emulation: opening, forward/reverse page turns, rapid navigation, closing copies, Escape/history/reopening, reduced motion, focus, viewport fit and the existing targeted axe scan. The new Inventory/Raven transition checks plus the existing raven/contact and physical satchel-card checks pass **13 checks with one intentional mobile skip** on WebKit and iPhone emulation. Build and lint pass. Outgoing decorative copies are inert, hidden from accessibility APIs and removed after completion or reopening. No messages were sent during verification.

## Journal editor (September 23)

Build and lint pass. Three server tests verify draft privacy, authenticated writes, cookie security, login throttling, file persistence across store reloads, stale-write rejection, invalid dates, corrupt-storage errors, fail-closed production configuration, and Redis REST request shape. The full editor/visitor flow passes in Chromium and iPhone WebKit: typing, private draft save, refresh/reopen, plaintext preview, backup download, publishing, independent visitor reads, editing, unpublishing and logout. Existing portfolio navigation/diary/contact regression coverage also passes in both browsers. Development credential/server/private-storage URLs return 403 for existing files, and generated server credentials are absent from the production browser bundle.

The hosted Redis service and deployed Vercel function have not been provisioned or exercised here. The production adapter was tested against a local REST contract fixture; final hosted smoke checks are documented in JOURNAL.md. All test entries used isolated temporary stores and were removed afterward.


## Raven anatomy refinement

The raven was rendered in Blender and inspected in the running contact scene. All seven articulated pivots remain present and optimized geometry contains only finite coordinates. Greeting/contact cues and reduced-motion/mobile fallback checks pass in Chromium and iPhone WebKit (four tests). Build and lint pass. The desktop contact preview reported 60 FPS with the new raven; this is a local observation, not a guarantee for all hardware. No messages were sent.
