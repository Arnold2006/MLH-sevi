# Project Audit — 25 August 2026 — Security + Data (password included)

**Date:** 25 August 2026
**Scope:** Security + data only, per owner request. Covers auth/session, password storage (including `data/password.json` by design), throttling, contact spam controls, JSON persistence, upload handling, media orphan detection, backup, and security headers. UI/performance/accessibility excluded by scope.
**Commit:** `3641cdf` → `6695ecb` (master, after PR #8 backup) — `src/lib/auth.ts:1`, `src/lib/db.ts:12`, `src/lib/storage.ts:1`, `src/lib/media.ts:1`, `src/app/api/backup/route.ts:1`, `src/app/api/unread/route.ts:1`, `next.config.ts:3`
**Method:** Static review of all source files in scope, greps for auth coverage and secrets, `npm run build` + `GET /api/unread` + `GET /api/backup` probes, `data/*.json` + `public/uploads` inspection. Password intentionally included in backup per owner confirmation.

---

## Executive summary

Previous high fixes remain sound (`src/lib/auth.ts:68` HMAC + `timingSafeEqual`, `src/lib/login-throttle.ts:8` 5/10m→15m, `src/lib/storage.ts:15` magic-sniff, `next.config.ts:12` HSTS). The application is production-ready for its threat model (single owner, HAProxy TLS termination, single-instance Node) after rotating `ADMIN_PASSWORD`/`ADMIN_SECRET` and ensuring HAProxy sets `X-Forwarded-Proto: https`.

New residual risks are operational: in-memory throttles and `load→modify→save` races (`src/lib/db.ts:38`), non-atomic image writes (`src/lib/storage.ts:59`), and memory-buffered backup (`src/app/api/backup/route.ts:50`). Severity: **0 critical · 2 high · 5 medium · 4 low** (all medium/low are mitigated by the deployment documented in `README.md`).

Password inclusion is **by design**: `src/app/api/backup/route.ts:21` zips `data/password.json` (sha256 unsalted `src/lib/auth.ts:39`). Documented below with at-rest handling guidance.

---

## Findings — Security

### HIGH

#### H1 — In-memory throttles and spoofable `X-Forwarded-For`
`src/lib/login-throttle.ts:7` `Map`, `src/lib/contact-throttle.ts:3` `Map`, keyed by `headers().get("x-forwarded-for")?.split(",")[0]` `src/app/admin/actions.ts:37`, `src/app/(site)/contact/actions.ts:22`, `src/lib/auth.ts:90`. Lost on restart/cold start, not shared across workers. `XFF` is client-controllable unless HAProxy overwrites/cleans — attacker can rotate IP per 5 tries to bypass 5/10m→15m. `"lokal"` fallback coalesces all empty-header attempts.
**Fix:** Persist throttles to file/Redis or enforce at HAProxy/fail2ban; sanitize `XFF` to last proxy-added entry; consider `request.ip` behind trusted proxy.

#### H2 — Stateless 7-day session, no revocation, fast unsalted hash
`src/lib/auth.ts:8` `SESSION_MS=7*24*60*60*1000`, `src/lib/auth.ts:68` `sign(payload)=HMAC-SHA256(secret).update(expires).hex`, `src/lib/auth.ts:30` `createSessionToken()`, `src/lib/auth.ts:103` `store.set(..., httpOnly:true, sameSite:"lax", secure:isHttps)`. No server-side jti/nonce; `endSession()` `src/lib/auth.ts:108` only deletes client cookie — stolen token valid until expiry. `src/lib/auth.ts:39` `hashOf=sha256(input)` unsalted, fast; `src/lib/auth.ts:23` `/^[a-f0-9]{64}$/` stored hex in `data/password.json` enables offline brute-force if zip leaks. Dual-password design `src/lib/auth.ts:43` means `ADMIN_PASSWORD` from `.env` always works alongside ejer hash — intentional recovery backdoor (`README.md:72`), but must be audited.
**Fix:** Shorten `SESSION_MS` to 24h + rotate on activity, add jti store in `data/` for revocation; migrate stored hash to `bcrypt`/`argon2` with salt (keep env fallback for recovery); document `data/password.json` at-rest encryption for backup.

### MEDIUM

#### M1 — `Secure` flag trusts `X-Forwarded-Proto` unconditionally
`src/lib/auth.ts:93` `isHttps=NODE_ENV==="production"` overridden `src/lib/auth.ts:97` `if(proto) isHttps=proto==="https"` from `x-forwarded-proto`/`x-forwarded-protocol` `src/lib/auth.ts:90`. Correct behind HAProxy setting `X-Forwarded-Proto: https` on `VIP:443` and `301` on `VIP:80` (per `README.md`), but direct `http://:3000` bypass with stripped header falls back to `NODE_ENV` — still `Secure` in prod, `false` in dev. No `__Host-` prefix.
**Fix:** Network-block direct `:3000`; optionally add `__Host-` prefix with `path=/` (already `path:/` `src/lib/auth.ts:99`).

#### M2 — No `Content-Security-Policy`, unauthenticated count leak
`next.config.ts:3` has `X-Frame-Options DENY`, `X-Content-Type-Options nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security 63072000` `next.config.ts:12` — sound for HAProxy. No `CSP`. `src/app/api/unread/route.ts:5` `GET` returns `{count}` with no auth (`Cache-Control: no-store` correct) — leaks only unread volume, by design for public `EjerLoginBadge` poll, but should be documented.

#### M3 — Backup includes password hash and is memory-buffered
`src/app/api/backup/route.ts:9` `isLoggedIn()` 401 else zip; `src/app/api/backup/route.ts:14` `readdir data/` filter `.json`, `src/app/api/backup/route.ts:21` includes `data/password.json` (included by design per owner). Hash is `sha256` hex, low cost. `src/app/api/backup/route.ts:50` `zip.generateAsync({DEFLATE level6})` buffers entire backup in heap + per-file `readFile` `src/app/api/backup/route.ts:26,41` — no size/stream limit, no rate-limit — repeated `GET /api/backup` can OOM (e.g., 100×6MB). `Cache-Control: no-store` present `src/app/api/backup/route.ts:56`, HSTS ensures HTTPS, but zip at-rest must be encrypted.
**Fix:** Stream zip (`generateNodeStream`), add size cap, rate-limit `GET /api/backup` (e.g., 1/min/IP), document at-rest handling; optionally encrypt zip or exclude `password.json` with opt-in flag (owner chose include — keep with warning).

---

## Findings — Data

### HIGH

#### H3 — Lost-update race on all JSON stores
`src/lib/db.ts:38` `save()` is `writeFile tmp→rename` atomic per file, but call-sites are `load→modify→save` without lock: `src/app/admin/actions.ts:129` `upsertService`, `src/app/admin/actions.ts:185` `addGalleryItem`, `src/app/(site)/contact/actions.ts:93` `submitContact` (vs `src/app/admin/actions.ts:309` `setMessageRead`). Two concurrent admins: A loads v1, B loads v1, A saves v2, B saves v3 overwriting v2 — A's gallery/message lost. Same for `services.json`/`messages.json`/`site.json`.
**Fix:** File lock (`open ... 'wx'` lockfile) or optimistic `etag`/version field, serialize with `async-mutex`.

#### H4 — Non-atomic image write + non-transactional DB+file ordering
`src/lib/storage.ts:59` `fsp.writeFile(path.join(UPLOADS_DIR,filename),bytes)` direct, no `tmp→rename`, no `fsync`. Crash leaves partial image listed by `src/lib/media.ts:14` and served with `Cache-Control immutable` `src/app/uploads/[...path]/route.ts:36` — poisoned cache. `src/app/admin/actions.ts:262` `removeGalleryImage` does `splice`+`deleteStoredImage` `src/lib/storage.ts:65` then `saveGallery` `src/app/admin/actions.ts:277` — if `saveGallery` fails (disk full, swallowing `catch{}` `src/lib/db.ts:28`), file already deleted but DB still references it → broken image. `src/app/admin/actions.ts:298` `deleteGalleryItem` and `src/app/admin/actions.ts:329` `addGalleryItemFromMedia` have same ordering. `src/app/admin/actions.ts:425` `uploadMedia` loops `saveUpload` without rollback (unlike `addGalleryItem` `src/app/admin/actions.ts:230` `Promise.all(saved.map(deleteStoredImage))`).
**Fix:** `saveUpload` via `tmp→rename` + `bytes.length` check (not `file.size` `src/lib/storage.ts:47`) + `randomUUID` vs `Date.now`+`Math.random`, `fsync`; order `saveGallery` before `unlink`; `uploadMedia` rollback on partial fail.

### MEDIUM

#### M4 — Media orphan detection gaps
`src/lib/media.ts:20` allowlist `/^[\w.-]+\.(jpg|jpeg|png|webp|gif)$/i` vs `src/app/uploads/[...path]/route.ts:24` `/^[\w-]+\.(jpg...)$/i` (disallows `.`/`_`), vs `src/lib/storage.ts:56` `slugify` names — mismatch: `my_photo.v2.jpg` listed but 404 via route and undeletable as orphan? `src/lib/media.ts:14` filters `.tmp`/`.corrupt`/`.svg`/spaces → invisible orphans never counted, leaked forever. `src/lib/media.ts:40` `getUsedPaths` only tracks `heroImage`/`aboutImage` (`src/lib/db.ts:50` site) + `gallery.images` (`src/lib/db.ts:73`) — ignores future `SiteSettings` image fields, and `uploads/...` without leading `/` false-positive. `src/lib/db.ts:25` corrupt `site.json=null` spread throws outside `load` try, leaving `used` empty → `src/components/admin/MediaManagerClient.tsx:44` shows bulk delete that would nuke everything via `src/app/admin/actions.ts:457` `deleteOrphanMedia` snapshot TOCTOU (file becomes used between `listMediaWithStatus` and loop `deleteStoredImage`).
**Fix:** Align regexes, include `.tmp` clean-up on startup, expand `getUsedPaths` to all image fields, re-check `used` per file before `unlink`, handle `load` shape validation.

#### M5 — Corrupt JSON silent reseed + single `.corrupt` backup
`src/lib/db.ts:25` distinguishes `ENOENT` vs parse error → `rename(target, target+".corrupt")` `src/lib/db.ts:27` before reseeding — correct, but `rename` overwrites existing `.corrupt` (single generation) and both `rename` and fallback `writeFile` are `try{}catch{}` `src/lib/db.ts:28,32` — disk-full hidden, caller gets in-memory defaults while disk stays broken. `src/lib/auth.ts:34` `saveStoredHash` does direct `writeFile` without `tmp→rename` — truncated hash falls back to `ADMIN_PASSWORD` via `loadStoredHash` `src/lib/auth.ts:23` validation `^[a-f0-9]{64}$`, silent credential revert. No `fsync` anywhere.
**Fix:** `tmp→rename` + `fsync` for all writes, version `.corrupt` with timestamp, surface disk errors.

### LOW

#### L1 — Backup incompleteness and stale snapshot
`src/app/api/backup/route.ts:21` flat `readdir` only, nested `uploads/subfolder` ignored (and `src/app/uploads/[...path]/route.ts:22` rejects `segments.length!==1`). `.corrupt` files excluded (`endsWith(".json")` false for `.json.corrupt`), `data/*.tmp` temp not included — recovery loses evidence. Reads race `save()` `src/lib/db.ts:42` `rename` — backup may be `gallery.json` v2 + `site.json` v1 inconsistent.

#### L2 — Upload size and naming quirks
`src/lib/storage.ts:47` checks `file.size` (attacker-controllable header) not `bytes.length` `src/lib/storage.ts:48` after `arrayBuffer()`. `src/lib/storage.ts:56` `Date.now36+Math.random` no existence check, low collision risk — use `randomUUID()`. `next.config.ts:18` `bodySizeLimit 8mb` vs `src/lib/storage.ts:13` `MAX_BYTES 6MB` — 20×`uploadMedia` would exceed 8MB and be rejected at framework before per-file 6MB logic, inconsistent UX.

#### L3 — Orphan graph TOCTOU on bulk delete
`src/app/admin/actions.ts:457` `deleteOrphanMedia` snapshots `listMediaWithStatus` then loops `deleteStoredImage` without re-checking `getUsedPaths` per file — concurrent gallery add could make file used after snapshot then deleted.

---

## Verified working (security + data, with evidence)

| Area | Check | Result |
|---|---|---|
| Auth | `src/lib/auth.ts:68` HMAC-SHA256, `timingSafeEqual` `src/lib/auth.ts:43` dual passwords (server `ADMIN_PASSWORD` + ejer `data/password.json`) both accepted, `src/lib/auth.ts:23` `/^[a-f0-9]{64}$/` | ✓ |
| Session | `src/lib/auth.ts:93` `Secure` via `X-Forwarded-Proto`, `httpOnly`, `SameSite=Lax`, `7d`, `isLoggedIn` guards all `requireAdmin` in `src/app/admin/actions.ts:309` etc. | ✓ |
| Throttle | `src/lib/login-throttle.ts:8` 5/10m→15m via `x-forwarded-for` `src/app/admin/actions.ts:37` | ✓ (in-memory, XFF caveat above) |
| Headers | `next.config.ts:12` `Strict-Transport-Security 63072000; includeSubDomains; preload` on `/(.*)`, `X-Frame-Options DENY` | ✓ |
| Build | `npm run build` | ✓ Compiled, 16 routes, `/api/backup` 138B |
| Backup auth | `GET /api/backup` unauth 401, auth 200 `application/zip` with `data/password.json` included per design, `no-store` | ✓ |
| Storage | `src/lib/storage.ts:15` magic-sniff `FF D8 FF`/`89 50 4E 47`/`RIFF…WEBP`/`GIF87a` ignores `file.type`, `src/lib/storage.ts:65` `startsWith("/uploads/")` + `startsWith(UPLOADS_DIR)` | ✓ |
| DB | `src/lib/db.ts:27` `.corrupt` on parse error, `structuredClone` `src/lib/db.ts:34`, `tmp→rename` `src/lib/db.ts:42` | ✓ (single-gen + no fsync caveat above) |

## Recommended order

1. Add file lock / `async-mutex` around `load→modify→save` in `src/lib/db.ts:38` and call-sites (`src/app/admin/actions.ts:158`, `src/app/(site)/contact/actions.ts:93`).
2. Make `src/lib/storage.ts:59` + `src/lib/auth.ts:34` atomic `tmp→rename` + `bytes.length` check + `randomUUID` + `fsync`; reorder `removeGalleryImage` `src/app/admin/actions.ts:262` to `saveGallery` before `unlink`; add rollback to `uploadMedia` `src/app/admin/actions.ts:425`.
3. Harden throttles: persist to file/Redis or enforce at HAProxy; sanitize `X-Forwarded-For` to last trusted proxy.
4. Backup: stream `jszip` (`generateNodeStream`), add size/rate limit, document at-rest handling for included `password.json` (owner chose include — keep with warning to store zip encrypted).
5. Align `src/lib/media.ts:20` / `src/app/uploads/[...path]/route.ts:24` regexes, expand orphan coverage, re-check `used` per file in `src/app/admin/actions.ts:457`.

---

## History

Previous audit 23 August 2026 (high `H1` zero commits, `H2` silent gallery, `H3` no throttle, `M1` corrupt overwrite, `M2` MIME-only, `M4` no honeypot, etc.) — all marked fixed in `AUDIT.md:133` and re-verified above as still sound. `H1` now `bbd8480`/`f784ebd` `master` has commits. `I4` default `ADMIN_PASSWORD=changeme` `src/lib/auth.ts:11` still ships — rotate before prod per `README.md`.

## Remediation log — 25 August 2026 (new, security + data scope)

| ID | Severity | Finding | Fix / Note |
|---|---|---|---|
| S1 | Medium (by design) | Backup includes `data/password.json` sha256 per owner request | Keep included with warning: store `mlh-sevi-backup-*.zip` encrypted at rest; hash is unsalted `src/lib/auth.ts:39` |
| S2 | High (residual) | In-memory throttles + XFF spoof | Document HAProxy sanitization; consider persistent store |
| D1 | High | Lost-update race `db.ts:38` | Add lock/mutex — not yet fixed |
| D2 | High | Non-atomic image write + DB+file ordering | Use `tmp→rename` and save DB before unlink — not yet fixed |

---

## Previous audit — 23 August 2026 (retained)

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

