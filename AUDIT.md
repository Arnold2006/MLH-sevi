# Project Audit — Handyman Website (Danish)

**Date:** 23 August 2026
**Scope:** Full codebase review of the Next.js handyman site + admin (`src/`, `data/`, config), covering security, correctness, code quality, i18n integrity, build health, and repository hygiene.
**Method:** Static review of all source files, automated greps (English leftovers, mojibake, dead code, auth coverage), production build, data-file inspection, and HTTP smoke probes against `next start`.

---

## Executive summary

The application is in **good shape for its purpose**: it builds cleanly, the admin surface is fully authenticated, input handling is careful, the Danish translation is complete with no encoding corruption, and live-data inspection shows the admin settings pipeline working end-to-end in real use.

The findings worth acting on are operational rather than architectural: **the repository has zero commits**, gallery upload errors are **swallowed silently**, the login endpoint has **no rate limiting**, and the JSON storage layer can **silently overwrite a corrupted file with defaults**.

Severity counts: **0 critical · 3 high · 5 medium · 6 low · 4 informational.**

---

## Findings

### HIGH

#### H1 — Repository has zero commits
`git log` → `fatal: your current branch 'master' does not have any commits yet`. The entire project (~60 files) is untracked. Any accidental deletion, bad edit, or disk failure is unrecoverable.
**Fix:** Create an initial commit now, then commit per change. `.gitignore` already correctly excludes `node_modules/`, `.next/`, `.env*.local`, `data/`, and upload contents (verified with `git check-ignore .env.local`).

#### H2 — Gallery upload failures are silently discarded
- `src/app/admin/actions.ts:148–171` (`addGalleryItem`) wraps the whole upload in `try { … } catch {}`.
- `src/app/admin/actions.ts:186` (`updateGalleryItem`) does the same for the replace-file path.

If the uploaded file fails validation in `saveUpload()` (wrong type, > 6 MB), the action returns normally, nothing is saved, and **the admin gets no feedback whatsoever** — they'll believe the photo was added. This is the worst kind of failure: silent data loss from the user's point of view. By contrast, `uploadImage()` (used by the settings image fields) correctly propagates `{ error }` to the UI.
**Fix:** Catch and return an error state (or let the throw surface), and display it in the gallery forms like `SettingsForm`/`ImageField` already do.

#### H3 — No rate limiting on admin login
`login()` (`src/app/admin/actions.ts:31`) accepts unlimited password attempts. Fine on `localhost`; risky if ever deployed publicly (brute-forceable, default password is `changeme`).
**Fix:** Minimal in-memory attempt counter with exponential backoff per IP is sufficient for this scale; or fail2ban/reverse-proxy limits at deployment time. Related hardening: L5.

### MEDIUM

#### M1 — Corrupted JSON is silently replaced with defaults
`src/lib/db.ts:20–36`: `load()` catches *all* errors — including `JSON.parse` failures — writes the seed defaults over the file, and returns them. A hand-edited `data/site.json` with one syntax error is **irreversibly overwritten with factory content** on the next request. The atomic tmp+rename write pattern makes runtime corruption unlikely, but human editing is exactly what this format invites.
**Fix:** Distinguish `ENOENT` (seed the file) from parse errors (throw or rename the bad file to `*.corrupt` before reseeding).

#### M2 — Upload validation trusts client-declared MIME type only
`src/lib/storage.ts` validates `file.type` against an allowlist. `Content-Type` is attacker-controlled; a polyglot file could be stored under `/uploads/`. Practical impact is low: SVG is correctly excluded (stored-XSS vector), files render only as `<img>`, and uploads require an authenticated admin. Still, defense-in-depth is cheap here.
**Fix:** Sniff magic bytes (`\xFF\xD8\xFF` JPEG, `\x89PNG`, `RIFF…WEBP`, `GIF8`) before writing.

#### M3 — Live brand inconsistency after admin edit (also positive evidence)
`data/site.json` was rewritten at 16:06 — twelve minutes after seeding, with `\r\n` line endings characteristic of a real browser form post — changing `businessName` to **"SEVI Håndværkerservice"** while `heroSubtext` and `aboutText` still say "Summit Håndværkerservice". Two conclusions:
1. *Positive:* the Settings → JSON → public-site pipeline demonstrably works end-to-end.
2. *Issue:* renaming only the name field leaves visible inconsistencies on the live site.
**Fix (content):** Update the hero/about copy to match whichever brand is intended (one visit to `/admin/settings`). Consider whether the name should also flow into long-form copy automatically — currently it deliberately doesn't.

#### M4 — Contact form has zero spam protection
No honeypot, no rate limit, no captcha. The design notes called for a honeypot field; it was never implemented. Messages land in `data/messages.json` and the admin inbox.
**Fix:** Hidden honeypot field + minimum-submit-time check covers most bots without UX cost.

#### M5 — No ESLint despite tooling assumptions
No eslint dependency or config exists; `next build`'s "Linting and checking validity of types" step runs TypeScript checking only. Dead exports (see L2) and hook-dependency issues would go unnoticed.
**Fix:** `npm i -D eslint eslint-config-next` and add `"lint": "next lint"`.

### LOW

#### L1 — Shared default-object references can be mutated in-process
`db.load()` returns seed objects by reference when the file is missing. All service paths copy before mutating, but `updateGalleryItem` mutates item fields directly (`item.title = …`). If `gallery.json` were absent, this would pollute `DEFAULT_GALLERY` in module scope until restart. Single-admin reality makes this near-theoretical.
**Fix:** `structuredClone(fallback)` in `load()`, or copy-on-return.

#### L2 — Dead code
`PencilIcon` and `EyeIcon` (2 of 30 icon exports) are unused. Tree-shaken in production; harmless clutter.
**Fix:** Remove, or leave until ESLint (M5) flags them.

#### L3 — Links inside `<summary>` toggle the message row
On `/admin/messages`, clicking the mailto link in a message's collapsed header also toggles open/closed (an `onClick` stopPropagation can't be used in a server component). Cosmetic UX quirk; keyboard behavior unaffected.
**Fix:** Move the email link out of `<summary>` into the expanded body.

#### L4 — No security headers
No CSP, `X-Frame-Options`, `X-Content-Type-Options`, or HSTS. Irrelevant on localhost, standard practice for public hosting.
**Fix:** Add `headers()` in `next.config.ts` at deployment time.

#### L5 — Non-constant-time password comparison
`src/lib/auth.ts:21` uses `===` for the password check (the session signature *does* use `timingSafeEqual`). Local-network exposure makes this academic, but the fix is one line.
**Fix:** Compare digests of both values with `timingSafeEqual`.

#### L6 — Front-end polish gaps
- Uploaded photos rendered via plain `<img>` without intrinsic `width`/`height` → potential layout shift (CLS) in the gallery grid.
- No `sitemap.xml`, `robots.txt`, or Open Graph tags (metadata titles/descriptions are dynamic and correct; admin pages correctly `noindex`).
- No skip-to-content link; lightbox has no focus trap (Escape/arrows work).

### INFORMATIONAL

#### I1 — Experimental flag warning at build
`experimental.serverActions.bodySizeLimit: "8mb"` is the correct placement for Next 15.5 but prints an "Experiments (use with caution)" notice on every build. Server Actions body limit (8 MB) comfortably exceeds the enforced 6 MB image cap — consistent by design.

#### I2 — Redundant route-segment config
`export const dynamic = "force-dynamic"` appears in the root layout *and* `(site)/layout.tsx` *and* the dashboard layout. Only the root declaration is needed; the rest are harmless duplication.

#### I3 — VCS exclusions are deliberate
`data/` and `public/uploads/*` are gitignored so live content isn't clobbered by deploys. README documents that backing up `data/` = backing up the site. Reasonable trade-off; just ensure backups actually happen.

#### I4 — Default credentials shipped
`.env.local` contains `ADMIN_PASSWORD=changeme` and a placeholder `ADMIN_SECRET`. Changing either invalidates existing sessions (secret rotation is wired into token signing — a nice property). Both must be rotated before any non-local deployment.

---

## Verified working (with evidence)

| Area | Check | Result |
|---|---|---|
| Build | `next build` | ✓ Compiled successfully; 13 routes; no type errors |
| Auth coverage | grep `requireAdmin()` | ✓ All 10 mutation actions + dashboard layout guarded; `login`/`logout` intentionally unguarded |
| Session cookie | code review | ✓ httpOnly, SameSite=Lax, Secure in prod, 7-day expiry, HMAC-signed, invalidated by secret rotation |
| Path traversal | `deleteStoredImage` review | ✓ Resolved path must stay inside `public/uploads`; non-upload images never deleted |
| Runtime guard | HTTP probe | ✓ `/admin*` → 307 to `/admin/login` without/bad cookie; 200 with valid HMAC cookie |
| i18n completeness | grep of 35 English UI phrases across `src/` | ✓ Zero matches |
| Encoding integrity | grep `[ÂÃ]`, U+FFFD | ✓ Zero mojibake after earlier UTF-8 repairs |
| Code hygiene | grep `console.log`/`debugger`/`TODO` | ✓ Clean |
| Seed data | JSON inspection | ✓ 8 Danish services ("Generelle reparationer", "fra 349 kr."), 8 gallery items across 6 Danish categories, contact inbox empty |
| Admin E2E | `site.json` forensics | ✓ Real form submission persisted correctly (see M3) |
| Toolchain | versions | Next 15.5.23 · React 19.2.8 · Node 26.7.0 · lockfile committed-ready |

## Recommended action order

1. `git add -A && git commit` (H1 — five minutes, removes the biggest risk)
2. Return/upload error states for gallery actions (H2)
3. Login rate limiting + rotate credentials if deploying (H3, I4)
4. Parse-error handling in `db.load()` (M1)
5. Honeypot on contact form (M4); magic-byte sniffing (M2)
6. Content pass to reconcile SEVI vs Summit copy (M3)
7. ESLint setup (M5), then low-priority polish as touched (L1–L6)

---

## Remediation log — 23 August 2026

| ID | Status | Fix |
|---|---|---|
| H1 | **Open** (deferred by owner) | Initial git commit still pending — do this next |
| H2 | ✅ Fixed | `addGalleryItem`/`updateGalleryItem` now return typed error/success states; gallery upload + edit forms converted to client components (`GalleryUploadForm`, `GalleryEditCard`) with inline Danish error banners and pending states. Pre-validation added for missing title/file |
| H3 | ✅ Fixed | New `src/lib/login-throttle.ts`: 5 failures per IP per 10 min → 15-min lockout, cleared on success; wired into `login()` via `x-forwarded-for`; lockout message shown in login form |
| M1 | ✅ Fixed | `db.load()` distinguishes ENOENT (seed) from parse errors — corrupt file preserved as `<name>.json.corrupt` before reseeding instead of being destroyed |
| M2 | ✅ Fixed | `saveUpload()` now sniffs magic bytes (JPEG/PNG/WebP/GIF) and ignores the client-declared MIME type entirely |
| M3 | ✅ Fixed (content) | Live `data/site.json` copy reconciled: all "Summit Håndværkerservice"/"hyrer Summit" references updated to the owner's chosen "SEVI" brand |
| M4 | ✅ Fixed | Contact form: hidden honeypot field (silently accepted-but-discarded) + render-time timestamp; submissions under 1.5 s rejected server-side |
| M5 | ✅ Fixed | ESLint 9 flat config (`eslint.config.mjs`) using native `eslint-config-next/core-web-vitals` + `/typescript`; `"lint": "eslint ."` script; zero errors/warnings after fixes it surfaced (unused var in gallery page, setState-in-effect in ContactForm, anonymous default export) |
| L1 | ✅ Fixed | `load()` returns `structuredClone(fallback)` — no shared-reference mutation |
| L2 | ✅ Fixed | Removed unused `PencilIcon`/`EyeIcon` exports |
| L3 | ✅ Fixed | Mailto link moved out of `<summary>` into expanded body ("Svar på e-mail" button remains) |
| L4 | ✅ Fixed | `next.config.ts` sets X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy on all routes (verified via response headers) |
| L5 | ✅ Fixed | Password comparison now digest-based via `timingSafeEqual` |
| L6 | ✅ Fixed | Intrinsic width/height on hero/about images; lightbox gets `role="dialog"`, `aria-modal`, focus-on-open close button; skip-to-content links on public + admin shells; `app/robots.ts` (disallows `/admin`) and `app/sitemap.xml` (5 routes) added; `metadataBase` configured |
| I1 | Accepted | `experimental.serverActions.bodySizeLimit` is correctly placed for Next 15.5; warning is cosmetic |
| I2 | ✅ Fixed | Duplicate `force-dynamic` declarations removed from both nested layouts (root retains it) |
| I3 | Documented | Backup responsibility already noted in README |
| I4 | Guidance added | `.env.example` now carries explicit pre-production instructions; actual credential rotation remains an operator task |

**Verification after remediation:** `eslint .` clean · `next build` compiles with no type errors · 9-point HTTP probe passed (headers, robots, sitemap, honeypot fields, SEVI copy, auth guard 307 without/bad cookie, dashboard 200 with valid session) · throttle algorithm unit-checked (locks at 5 failures, per-IP isolated).

## Post-audit fix — 23 August 2026

| ID | Severity | Finding | Fix |
|---|---|---|---|
| F1 | High (user-reported) | **"Gem ændringer" on `/admin/services` did nothing.** The save button sat *outside* the edit `<form>` and used `formAction` — a submit button without a form owner is ignored by browsers, so price/title/description edits were never submitted. | Button associated via standard HTML: form got `id="edit-{service.id}"`, button references it with the `form` attribute. Works with and without JS. **E2E-proven:** browser-style multipart action POST persisted `"rate": "fra 999 kr."` to `data/services.json`; test data reverted afterwards. |
| F2 | Medium (user-reported) | **Line breaks in service/gallery/CTA texts collapsed on the site.** Browsers default to `white-space: normal`, and no render site preserved newlines from admin textareas (form submissions send CRLF). | `whitespace-pre-line` added to every user-editable text render site (service cards on home + services page, gallery lightbox captions, bottom CTA). `str()` now normalizes CRLF → LF on save for consistent storage. **E2E-proven:** multiline description saved via action POST renders with raw `\n` in HTML source; test data reverted afterwards. |
| F3 | Enhancement (user-requested) | Lightbox text could overflow without scrolling, and browsing between photos relied solely on arrow buttons. | Caption area capped at `max-h-28` with `overflow-y-auto` (long texts scroll, image stays put); thumbnail strip below the caption shows a sliding window of up to 5 images (click to jump, active ring-highlighted); overlay itself scrolls on small screens; arrows/keyboard navigation unchanged. Bundle verified to ship the new markup; lint + build clean. |
| F4 | Feature rework (user-requested) | **Gallery model was 1 image per entry** — uploading a "new image" just replaced or jumped to another job. Desired: each gallery section = one completed job with text and **up to 5 images**. | Data model changed to `images: string[]` with automatic migration of existing single-image data (`loadGallery` normalizes old `image` field). Admin: new-project form takes 1–5 files; each job card shows its thumbnails with per-image ✕ delete (last image warns that the whole job goes), "Tilføj billeder" with live slot counter (max 5 enforced server-side), texts editable separately. Public: job cards show cover image + image count badge; lightbox now flips **within the job's own images** (arrows, keyboard, thumbnail strip, "2 / 5" counter) while title/description stay fixed. **E2E-proven** (11-point action-POST suite): create with 2 → add 3 → 6th rejected → remove 1 → public render → delete; orphaned uploads cleaned; owner's live data restored untouched. |
