# Asset provenance and rebuild

The three artifact GLBs, the doorway GLB, and their inspection/fallback renders were created in Blender specifically for this portfolio. No third-party raven mesh, stock 3D asset, or reference-image texture was used. The supplied concept sheets informed the palette, materials and artifact composition. The assets are an original stylized realtime interpretation, not a reproduction of the photorealistic concept renders.

- Editable sources: `scripts/codex-artifacts.blend` for the original set; `scripts/codex-satchel.blend` for the refined satchel; `scripts/codex-raven.blend` for the enchanted raven; `scripts/codex-doors.blend` for the doorway. The generator builds the latest versions of all three.
- Deterministic generator: `scripts/build-artifacts.py` (Blender 5.x).
- Web optimization: `scripts/optimize-assets.mjs`.
- Runtime: `src/components/three/ArtifactModel.tsx`, `satchelMotion.ts`, `book/BookReader.tsx` and `GrandHallScene.tsx`.

Run Blender in background with the generator, then `npm run assets:optimize`. On macOS the Blender executable is `/Applications/Blender.app/Contents/MacOS/Blender`. The generator uses the locally installed Georgia font for the H crest and Roman chapter marks; Georgia geometry is converted to meshes, with no Georgia font binary distributed. Site display fonts are bundled locally as described below.

`-- --blockout` produces a simplified model pass before detailed modeling. Normal generation produces the full editable scene, original 512×512 leather color/normal textures and transparent posters. Exported GLBs use Meshopt geometry and WebP textures. All authored meshes have realtime geometry and independently named animation pivots. Animations run in React/GSAP rather than duplicated embedded GLB clips, keeping URL-driven reverse transitions interruptible.

Book: front-cover hinge, clasp, back cover, spine, page block, left/right pages, H crest, three chapter tabs. The full-screen reader uses HTML page faces and a spine-based page turn; no extra page mesh is loaded. Satchel: independent flap, buckles, four artifact slots. Additional inventory entries can clone an existing slot at runtime without reauthoring the model. Raven: articulated body, head, eye group, two shoulder pivots, tail, and a sealed envelope attached to the head. Feather detail is geometry, with no alpha textures.

The source photo files are preserved. Some files named `.png` actually contain HEIC; the optimizer routes these through the macOS image decoder before producing correctly encoded WebP. EXIF is stripped from the web derivatives. The Letterboxd diary uses a sandboxed iframe and retains the direct profile link.

## Fonts

The existing Cinzel and IM Fell English web fonts are bundled under `public/fonts/` (158,132 bytes combined, including the Cinzel extended Latin subset). Google Fonts supplied the WOFF2 variants. Their SIL Open Font Licenses are included as `cinzel-OFL.txt` and `imfellenglish-OFL.txt`, sourced from the corresponding directories in https://github.com/google/fonts/tree/main/ofl. Body text in the book uses system Arial/Helvetica; no additional font request is needed for readable content.

## Refined satchel

Rebuild only the bag with `Blender -b --python scripts/build-artifacts.py -- --asset satchel`, then run the optimizer. This preserves the exported book and raven and merges only the new bag entry into the manifest. The focused editable source is `scripts/codex-satchel.blend`; `public/models/satchel-open.png` is an inspection render of its open pose.

The body is a hollow mesh with exterior leather, an inward-facing suede lining, rolled opening, and recessed floor. A curved solid flap and its two strap tails share the rear hinge. Separate buckle pivots release before the flap opens. Side pockets, a front document pocket, sewn seams, brass anchors, and a flat shoulder ribbon complete the shape. The shoulder loop follows separate front/back paths to avoid coincident faces.

Four narrower cards have distinct tree, compass, mountain, and cinema motifs. They rise vertically after flap clearance, then fan apart; closing reverses that sequence. The original bag used 51,148 triangles; the refined bag uses 38,796, with an optimized GLB of 377,156 bytes. Card label curves are deliberately low-detail to avoid spending geometry on tiny engraved lettering.

## Enchanted raven

Rebuild with `Blender -b --python scripts/build-artifacts.py -- --asset raven`, then run the optimizer. The focused editable source is `scripts/codex-raven.blend`. Its refined 93,256 triangles compress to a 1,081,192-byte GLB. The spellbook and satchel exports are preserved by this focused build.

Independent shoulder pivots carry layered flight feathers and coverts. The tail has its own pivot; the sealed envelope is parented to the head so it stays held in the beak. Fine blue-black feather textures, small glossy dark eyes, and plain engraved brass perch rings are authored in the GLB. The rune halo and perch glyphs were removed at the user’s request. Forty-two soft runtime motes supply a restrained magical surround without a postprocessing/bloom pass.

`RavenEnchantment.tsx` animates breathing, blinking, head turns, tail sway, hover attention, occasional stretches, and greeting/preparation gestures. `ravenSignals.ts` carries only named animation cues, never the contact form contents. Reduced motion keeps a static pose and omits the optional greeting button; background rendering follows the existing scene suspension. Contact continues to prepare a mailto draft, with no delivery claim or backend sending behavior.


## Grand Hall and entrance

The entrance is a real modeled asset: `public/models/doors.glb`, with editable source `scripts/codex-doors.blend`. Rebuild only the doorway with `Blender -b --python scripts/build-artifacts.py -- --asset doors`, then run the optimizer. Its 54,340 triangles and 10 meshes compress to 1,213,036 bytes. The doorway is requested only for the first-visit entrance; it is not an image or CSS-transformed door panel.

Two independent hinge roots carry solid oak leaves with thickness, recessed plank panels, raised rails, iron straps, rivets, hinge barrels, heavy bronze knockers and branching forged hinges. The doors have no monograms. A masonry arch, individual jamb stones, a threshold, side walls, and emissive torch sconces surround the opening. `doors.png`/`doors.webp` are inspection renders, not the website entrance.

`EntranceDoorway.tsx` renders the GLB in the same world as the hall at Z=15. `entranceMotion.ts` opens the leaves and moves the camera from Z=25 to Z=12.1, physically crossing the threshold after clearance. Small vertical, horizontal, and roll components suggest footsteps. The 8.2-second sequence settles at the existing Hall camera pose. Only accessible text and the skip control are HTML overlays.

`FloatingCandles.tsx` draws 16 wax tapers, their brass rings, flames, and soft glows in four instanced draw calls. Candle positions sway independently; flame tips flicker. `Study.tsx` adds columns, window mullions, procedural star fields, a crescent moon, cool fill light, and a continuous textured stone floor. The illustrated fallback has lightweight CSS candlelight. All ambient movement respects reduced motion and the existing background rendering suspension.

The doorway uses original baked color, normal and roughness maps for fumed oak, weathered basalt, hammered iron and oxidized bronze. Physical-scale UVs continue the grain across raised and arched planks. Shared basalt maps in `public/models/materials` also skin the permanent room, with 228 KB of WebP textures. The PNGs are editable generation sources.


### Anatomical raven refinement

The focused builder now delegates to `scripts/raven_geometry.py`. Continuous lofts blend the breast, neck, crown and cheeks. Swept-back primaries, overlapping coverts, a graduated wedge tail, nasal bristles, shaggy throat feathers, curved upper/lower mandibles, and articulated toes replace the original upright body and broad feather plates. Original packed 512px colour, normal and roughness textures add feather-barb detail without transparent cards. A smaller sealed letter follows the head pivot. The existing animation pivots are preserved; the wings now open outward from the flanks. Both the GLB and illustrated fallback were regenerated. The optimized raven is approximately 1.08 MB, with 25 meshes.
