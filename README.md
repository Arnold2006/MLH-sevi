# MLH-sevi — Hjemmeside

A clean, professional website for a local handyman business, with a built-in
admin area so the owner can update everything themselves — no coding required.
All site and admin content is in Danish.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the site and http://localhost:3000/admin/login
for the admin area.

**Default admin password:** `changeme`
(defined in `.env.local` — change it before going live)

Requires **Node 20 or 22 LTS** (`v24.19.0` also works).

Copy `.env.example` → `.env.local`:

```
ADMIN_PASSWORD=your-strong-password
ADMIN_SECRET=any-long-random-string
NEXT_PUBLIC_SITE_URL=https://mlh-sevi.com
# Optional - Cloudflare Turnstile for contact form
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAA...
# TURNSTILE_SECRET_KEY=0x4AAAA...
```

## Production

```bash
npm run build
npm run start   # serves on :3000 behind HAProxy/Nginx
```

*Behind HAProxy TLS termination* the app runs as `http://:3000` internally and HAProxy handles `https` + certs. Set `X-Forwarded-Proto: https` on the `:443` frontend (and `301` on `:80`) so `Secure` cookies and `Strict-Transport-Security` (`next.config.ts`) work correctly. `NEXT_PUBLIC_SITE_URL` must be `https://...` or canonical URLs fall back to `http://localhost:3000`.

On aaPanel Node project: `Package Manager: npm` → `Run opt: start [next start]` → `Port: 3000` → `Install` → `Build` → `Restart Project`.

## Admin area

Visit `/admin/login` (there's also an "Ejer-login" link in the site footer — with a matte red badge `src/components/site/EjerLoginBadge.tsx` showing unread messages via `GET /api/unread`, polling every 3s).

From the dashboard the owner can:

| Section | What it controls |
|---|---|
| **Ydelser** | Add, edit, reorder, or delete services and their prices |
| **Galleri** | Create projects with up to 5 images **from the Media Library** — pick existing images, not direct upload. Edit title/category/description, add/remove images per project (`src/components/admin/MediaPicker.tsx`, `src/app/admin/actions.ts` `addGalleryItemFromMedia`) |
| **Medier** | Central media library (`src/lib/media.ts`, `src/app/admin/(dashboard)/media/page.tsx`): bulk upload up to 20, list all `public/uploads/*` with *I brug / Forældreløs* detection (checks `site.heroImage`/`aboutImage` + all gallery images), copy path, delete single, **Slet alle forældreløse** — keeps `data/` references clean |
| **Indstillinger** | Business name & tagline, phone/email, service area, hours, hero text + image (with drag + sliders for `objectPosition` → `heroImagePosition` `src/components/admin/ImageField.tsx`), about story + photo (same position control), **Forside — "Hvorfor vælge os"** (`homeWhyTitle` + `homeWhyBullets` one per line — replaces the hardcoded trust-bar title "Professionel og omhyggelig" + 4 green bullets `src/app/(site)/page.tsx:186`), stats, bottom CTA |
| **Beskeder** | Read, mark read/unread, delete contact-form submissions — marking updates the `Ejer-login` badge immediately (`POST /api/unread` polling + `revalidatePath("/", "layout")`) |
| **Backup** | One-click download of all data + images as `mlh-sevi-backup-YYYY-MM-DD.zip` via `GET /api/backup` (`jszip` `src/app/api/backup/route.ts`) — contains `data/*.json` + `uploads/*` + `README.txt`, requires login (`401` otherwise), linked from Admin → Backup |
| **Adgangskode** | Change the **ejer-login** password inside admin (`src/app/admin/(dashboard)/password/page.tsx`, `src/components/admin/PasswordForm.tsx`). Saved as `data/password.json` (sha256). The **server-admin** password from `ADMIN_PASSWORD` in `.env.local` **always still works** alongside the ejer code — so you never lock yourself out. Delete `data/password.json` to revert to `.env` only. |

## Contact form — spam protection

`src/app/(site)/contact/actions.ts` + `src/lib/contact-throttle.ts`:

* 2 honeypots (`company` + `website` off-screen)
* Time trap: ≥3s and ≤2h (`startedAt`)
* IP rate-limit: 3 messages / 10 min (`X-Forwarded-For` via HAProxy)
* Link spam: >2 `http://`/`www.` blocked
* Optional **Cloudflare Turnstile** — set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` to enable `cf-turnstile` widget (`src/components/site/ContactForm.tsx:13`); without keys it falls back to honeypots alone.

## Changing the admin password

**New (inside admin):** `Admin → Adgangskode` — enter current + new (≥8 chars) → saved to `data/password.json`. Both the new **ejer** code **and** the server code (`ADMIN_PASSWORD` from `.env.local`) are accepted at `/admin/login`.

**Still supported (via file):**

```
ADMIN_PASSWORD=your-new-password
ADMIN_SECRET=any-long-random-string
```

Changing the `.env` file requires `pm2 restart`. The file-based ejer code overrides but does not replace the env code.

## How data is stored

* Site content lives in human-readable JSON files inside `data/` (`site.json`, `services.json`, `gallery.json`, `messages.json`, `password.json` if ejer code changed). Back these up to back up the whole site — or use **Admin → Backup** to get a ready-made zip.
* Uploaded images are saved to `public/uploads/` (served at `/uploads/*` via `src/app/uploads/[...path]/route.ts:1` **and** the static `public/` folder — works behind any Nginx/HAProxy that might otherwise bypass Next).
* Orphan detection (`src/lib/media.ts:27` `getUsedPaths()`) finds files in `public/uploads` not referenced in `data/` — shown as *Forældreløs* in Medier.
* Placeholder artwork lives in `public/images/` (safe to keep; the admin uploads simply override what's shown).

## Tech

* Next.js 15 (App Router) + TypeScript + React 19
* Tailwind CSS v4
* Server Actions for all admin mutations
* HMAC-signed session cookie (`src/lib/auth.ts` — `Secure` is HAProxy-aware via `X-Forwarded-Proto`, `7-day` expiry)
* `jszip` for backup zips, `nanoid`-free `crypto.randomUUID` for IDs
* Zero database — JSON + filesystem, `flock`-safe via `fs` + atomic `tmp→rename` in `src/lib/db.ts`
* `Strict-Transport-Security` + `X-Frame-Options` etc. in `next.config.ts`, `HSTS 63072000; includeSubDomains; preload`
