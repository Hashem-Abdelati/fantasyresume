# Codex evolution — audit and architecture

Baseline: React 19.2, TypeScript 5.9, Vite (Rolldown), Tailwind 4, React Router 7. Vercel rewrite handles direct SPA routes and excludes `/api/`. Journal publishing uses a Vercel Node function with Upstash Redis. Cinzel / IM Fell English are bundled locally with their open font licenses. All seven existing pages inspected locally; live landing verified against repository. The supplied images are target concept sheets, rather than the current implementation.

Preserve `/`, `/hub`, `/about`, `/projects`, `/experience`, `/contact`, `/inventory`. Add `/character`, `/quests`, `/journey`, `/raven`, `/grand-hall` aliases. Keep existing professional content, projects, timeline, inventory writing/photos and contact destinations.

One persistent React Three Fiber canvas sits behind the router outlet. Location selects HALL, BOOK, SATCHEL or RAVEN; GSAP controls camera and object transitions. Actual text remains in the existing React components, rendered immediately on direct navigation. Semantic navigation duplicates actions, never resume data. The 3D scene requires no backend or Zustand; only journal persistence uses the server API.

Separate authored Blender GLBs have hinge roots and named nodes. Runtime animation is procedural: cover/clasp, satchel flap and rising cards, raven head/blink/envelope. Own generated materials and geometry; no third-party model license. Source Blender file and rebuild script remain included. Model fallback posters are rendered from those same assets.

Small screens default to deliberate static artifact navigation with an optional 3D mode. Reduced motion disables ambient animation and shortens transitions. WebGL/asset failures leave all navigation and text usable. A scene toggle is available in the Hall, Inventory, and Contact views. Existing dialogs gain shared focus, Escape and scroll handling. HEIC sources are retained but converted web assets are used.

QA: route and navigation checks, keyboard dialogs, reduced motion, mobile layouts, disabled WebGL, failed assets, throttled loading, console review, model triangle/payload measurements. Chromium, WebKit and Firefox automation where installed; any untested actual browser/device is called out.

## Full-screen spellbook reader

Character, Quests, and Journey render two semantic `FolioPage` leaves inside `BookReader`. Leather boards, layered page edges, a central gutter, and chapter bookmarks frame real selectable HTML on parchment. The character skill tree is inline. Project and experience indexes select the facing-page dossier using URL query parameters, with browser history and direct links preserved. Inventory and Contact retain their separate artifact layouts.

The 3D book begins opening first. After a 420 ms lead-in, the reading surface unfolds and expands over 1.45 seconds from the projected physical cover position. The canvas keeps its full viewport throughout the handoff, crossfades behind the paper and stops rendering only after the reader has settled. Reader controls fade in toward the end. Chapter turns use 850 ms Web Animations with front/back DOM facsimiles, captured before navigation (including each page’s scroll offset). These decorative copies are inert, hidden from accessibility APIs, and removed after the turn. Rapid navigation cancels the previous animation before starting the next; reduced motion skips it. Narrow screens use vertically stacked full-width leaves and a short transition. Long desktop leaves scroll individually with overflow hints.

The disconnected Three.js blank page mesh was removed. The underlying 3D scene fades during opening and stops rendering after the reader covers it; returning to the Hall restores rendering. A temporary inert copy of the current pages survives route unmount for a 1.45-second cover fold and return toward the physical book. It preserves scroll offsets, removes IDs and is cancelled when the reader reopens. Close, Escape, navigation and browser history share this path; reduced motion skips it. Narrow screens use a shorter upright transition. No generated image or model payload was added for this refinement.

The readability pass uses 17px dark body text (16px on narrow screens), clear sans-serif section labels, quieter parchment, larger skill labels, and stronger spacing. Decorative lettering is reserved for chapter titles. Bookmarks remain available while scrolling on mobile, and page overflow hints explicitly indicate more content. The existing display fonts are served locally to avoid external font-loading delays.

## Satchel refinement

`three/satchelMotion.ts` sequences buckle release, a curved flap rotating around its rear hinge, vertical card extraction, and outward fanning. It stores full authored rest transforms and brings cards home before closing the flap. Every new route transition cancels the old timeline and starts from the current pose. On desktop, the Inventory reserves 44% of the width for the asset; its caption sits below the bag. A higher viewing angle and local fill light reveal the actual cavity.

`tests/satchel-geometry.spec.ts` loads the compressed GLB, decodes normalized positions, and uses its real triangle meshes to sample opening, closing, and interrupted paths. It checks card bounding-box separation, card-edge intersection against the flap/body, and a downward ray reaching the recessed floor. `tests/satchel-browser.spec.ts` clicks each physical card and verifies its story in all three desktop engines.


## Enchanted raven

The raven has independent wing and tail pivots, with the letter attached to its head. `RavenEnchantment.tsx` owns its imperative frame animation and lightweight mote surround. Per-frame transforms use refs and cached rig nodes, without React state updates. Contact emits named greeting, attention, and draft-preparation cues; listeners exist only while the raven is selected and motion is enabled, with cleanup on route or preference changes. No form data enters the animation layer.

The Contact stage reserves 44% of desktop width, uses aspect-aware camera framing and cool fill/rim lights, and keeps the caption below the perch. An accessible greeting button duplicates the bird's click interaction. Reduced motion hides this optional control and keeps the bird static. The contact form remains available in illustrated/mobile modes and opens a mailto draft with an explicit “MESSAGE PREPARED” state.


## First-visit entrance and Grand Hall

On an initial `/` or `/hub` visit with WebGL and motion enabled, `AppShell` mounts a real modeled doorway in the shared Three.js scene and makes the underlying interface inert and visually hidden. `HallEntrance` supplies only accessible title/skip controls; there are no image doors or CSS door leaves. After the doorway and portfolio artifacts are ready, the doors hold briefly before opening. `EntranceDoorway` owns the camera during the 8.2-second walking sequence and calls completion when the camera has crossed the doorway and reached the Hall pose. Stone aisle bands provide a stable reference for the forward movement and subtle footstep bob.

A sessionStorage flag prevents replay on return navigation or reload in the same tab session. Direct chapter links, reduced motion, unavailable WebGL, and a saved illustrated-mode preference bypass the entrance. Supported mobile browsers that start with the 3D entrance retain the same 3D Hall on arrival, with a wider lens to keep the artifacts in view. Chapter routes still use the existing mobile reading layout. Completing an entrance at `/` replaces the URL with `/hub`.

Skip and Escape dismiss immediately. Focus stays on the skip control during entry and returns to main content afterward; scrolling is restored on cleanup. A missing doorway bypasses the introduction, and a ten-second loading timeout prevents a stalled asset from blocking the portfolio. Background rendering suspension also pauses the frame-driven walk. The normal chapter camera resumes ownership after the walk finishes. The doorway and entrance lights remain mounted behind the camera; the canvas stays fixed at the same size and DPR throughout arrival. A 1.2-second interface fade follows a gentle camera settle.

`FloatingCandles` uses instanced meshes for wax, brass, flames, and additive glows, with cached transforms and no per-frame React state. The window star fields are procedural shaders. The raven keeps its motion and letter but no longer has a surrounding rune circle or perch glyphs.

`RoomShell` encloses the shared scene with instanced masonry walls, vaulted ceiling, structural ribs, textured floor and aisle bands. These meshes stay in place during the walk and later navigation. The camera uses quintic easing for forward travel with zero endpoint velocity and acceleration, subtle footstep motion, and a short still interval before returning control.

## Shared artifact transitions

`ArtifactChapter` stages Inventory and Contact content after the camera starts approaching the satchel or raven. In 3D mode the caption starts at 320 ms and the panel at 520 ms, each with an 800 ms eased reveal. Exiting keeps an inert, ID-free visual copy for 520 ms as the camera returns; reopening cancels the copy for that artifact. This works with links, Escape, and browser history without delaying navigation. Reduced motion skips the animation. The scene now uses a fixed full viewport for every artifact; chapter lens/target compensation preserves the existing desktop framing. Mobile visitors who entered through the 3D doors keep the same scene across artifact routes.


## Journal publishing

`api/journal.ts` exposes the shared handler in `server/journal-handler.ts`. Production uses the Redis REST adapter; Vite development and preview use an atomic local file store. Public reads exclude drafts. Owner reads and writes require server-verified sessions; the code hash and signing secret remain outside the client bundle. Revision checks and atomic Redis writes prevent conflicting updates from overwriting one another. The discreet Inventory key opens `JournalEditor`, which supports private drafts, publishing/unpublishing, plain-text previews and JSON backups. Original illustrated artifacts remain intact, and the Inventory grid grows with published entries. See [hosting setup](JOURNAL.md).
