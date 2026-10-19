# Live journal publishing

**Currently parked:** the Inventory key and journal loading are disabled via `JOURNAL_ENABLED` in `src/data/journal.ts`. The editor and storage code are retained for later. The instructions below apply when it is re-enabled.

The small key below the Inventory opens the **Master spell**. Unlock it to add entries, save private drafts, preview your writing, or publish. Published entries become Inventory cards for all visitors on their next load—no code edit, Git push, or redeploy. Select an entry in the editor to change it. **Return to private draft** removes it from the public Inventory. **Backup** downloads all your entries, including drafts; keep this file private.

The four original illustrated artifacts are preserved. This editor manages the additional journal entries. Writing is plain text with preserved paragraphs, so pasted HTML cannot execute.

## One-time Vercel setup

1. Import this app into Vercel. Set **Root Directory** to `hashem-resume-fantasy` if importing the parent Git repository. Use the Vite preset, build command `npm run build`, and output directory `dist`. The `api/journal.ts` file deploys as a Node function; the SPA rewrite excludes `/api/`.
2. Create an Upstash Redis database and set these **server environment variables** in the Vercel project:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN` — use the read/write REST token.
3. The access code requested during development is already configured privately in this computer’s `.env.local`. Copy `JOURNAL_PASSWORD_HASH` and `JOURNAL_SESSION_SECRET` from that file into the Vercel environment variables. Neither is a browser variable: **never prefix them with `VITE_`**. To generate fresh credentials or change the code, run `npm run journal:setup` from this directory; it prompts without displaying your code and rotates the session secret.
4. Apply all four values to **Production**, then deploy. Environment changes need a new deployment; later journal edits do not. Use a separate database for Preview deployments so testing cannot change live entries.
5. On the deployed site, open Inventory and unlock the key. The editor must say **Live portfolio**. Save a private draft and confirm it is absent in a signed-out browser. Publish it, reload that browser, and confirm its card is visible. Edit it, publish the changes, and verify again.

There is no cloud database connected to this checkout yet. Creating the hosted database and supplying its credentials are the remaining hosting steps. The implementation does not silently fall back to local or temporary disk storage on Vercel: if configuration is missing, the owner editor reports it and refuses writes.

## Local development

Run `npm run journal:setup` once if credentials are absent, then `npm run dev`. Local development and `npm run preview` use `.journal/entries.json` on this computer. The editor explicitly labels this **Local preview**. It survives browser and dev-server restarts, but does not update the live website. Create final entries on the deployed site; local test entries are not migrated automatically. `.journal/`, `.env.local`, and other `.env` credentials are excluded from Git and denied by the development file server.

## Storage and access

Production uses Upstash’s HTTPS Redis API. Entries are stored under `codex:journal:v1`; login throttling uses `codex:journal:attempt:login`. Drafts are filtered on the server before any public response. Writes require a signed, one-hour HttpOnly / SameSite cookie, secure HTTPS in production, and same-origin JSON requests. The code is salted and hashed with scrypt. Login attempts are limited to eight per 15 minutes, shared across requests. Rotating the session secret invalidates existing sessions. Concurrent saves return a conflict instead of overwriting another window; **Reload list** keeps the unsaved text so you can save again.

Use the backup button periodically. Each entry supports a 100-character title, 220-character description, and 30,000-character body, with up to 500 entries. The Inventory expands beyond its original 12 slots.

Implementation references: [Vercel Node functions](https://vercel.com/docs/functions/runtimes/node-js), [Upstash REST API](https://upstash.com/docs/redis/features/restapi).
