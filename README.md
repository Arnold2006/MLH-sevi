# Summit Håndværkerservice — Hjemmeside

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

## Production

```bash
npm run build
npm run start
```

## Admin area

Visit `/admin/login` (there's also an "Ejer-login" link in the site footer).
From the dashboard the owner can:

| Section | What it controls |
|---|---|
| **Ydelser** | Add, edit, reorder, or delete services and their prices |
| **Galleri** | Upload project photos, set title/category/description, replace or delete photos |
| **Indstillinger** | Business name & tagline, phone/email, service area, hours, hero text + image, about story + photo, stats, bottom call-to-action |
| **Beskeder** | Read, mark read/unread, reply to, and delete contact-form submissions |

## Changing the admin password

Edit `.env.local`:

```
ADMIN_PASSWORD=your-new-password
ADMIN_SECRET=any-long-random-string
```

Changing `ADMIN_PASSWORD` immediately signs out existing sessions.

## How data is stored

- Site content lives in human-readable JSON files inside `data/`
  (`site.json`, `services.json`, `gallery.json`, `messages.json`).
  Back these up to back up the whole site.
- Uploaded images are saved to `public/uploads/`.
- Placeholder artwork lives in `public/images/` (safe to keep; the admin
  uploads simply override what's shown).

## Tech

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Server Actions for all admin mutations
- HMAC-signed session cookie (no external auth service)
- Zero database dependencies
