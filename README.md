# Visit Rwanda Academy

A full-stack tourism platform for Rwanda: destination directory, official pricing with sources,
visitor accounts, booking requests, and an administrator content and booking dashboard.

> **Note on the starting point:** this repository arrived empty (no prior Visit Rwanda code, database
> or assets were present in the workspace or Git history), so the platform was implemented from
> scratch as a complete Next.js + PostgreSQL application. There is no second, disconnected copy:
> this is the single codebase for the site.

---

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router, React 19, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + a small custom design system in `app/globals.css` |
| Database | PostgreSQL (hosted) / embedded PGlite for local development |
| ORM | Drizzle ORM + generated SQL migrations |
| Auth | Database-backed sessions, HttpOnly cookies, scrypt password hashing |
| Email | Resend HTTP API when configured; otherwise logged + stored in the admin inbox |
| Images | Next Image; uploads stored in PostgreSQL and served through `/api/media/:id` |

---

## Quick start (local)

```bash
npm install
cp .env.example .env.local      # then fill AUTH_SECRET and ADMIN_* values
npm run dev                     # http://localhost:3000
```

With `DATABASE_URL` empty, the app starts an embedded PostgreSQL (PGlite) instance in `./.pglite`,
applies the migrations and seeds the content automatically on first request. This is for local
development only — never use it in production.

Create the initial administrator (never hardcode credentials in source):

```bash
npm run admin:create -- --email you@example.com --password 'A-strong-password1' --name "Your Name"
```

Or set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME` before the first start; the administrator is
created automatically during seeding. No administrator exists without one of these, and the admin
routes reject every non-admin session.

Useful scripts:

```bash
npm run build          # production build
npm run db:migrate     # apply migrations to DATABASE_URL
npm run db:seed        # seed destinations/prices/people/content (idempotent)
npm run admin:create   # create or promote an administrator
```

---

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Production | PostgreSQL connection string (Neon, Supabase, RDS, Railway…). Empty = local PGlite. |
| `AUTH_SECRET` | Yes | Random string used to hash session tokens and reset tokens. Required in production: without it the administrator area answers 503 instead of trusting a built-in fallback secret. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public origin used in emails, password-reset links and the `sitemap.xml` / `robots.txt` URLs. Set it to the origin the site is actually served from (see below). |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Seeding | Initial administrator creation; remove after first start if you prefer. |
| `RESEND_API_KEY` | Optional | Enables real email delivery (booking acknowledgement, approval/rejection, password reset). |
| `MAIL_FROM` | Optional | From address for transactional email. |
| `ADMIN_NOTIFICATION_EMAIL` | Optional | Receives an email for every new booking. |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Features

### Public site
- One **persistent cinematic layer** for the whole site (`components/site/CinematicLayer.tsx`): the
  player is mounted once in the root layout, keeps playing while the visitor scrolls, and is never
  restarted or reloaded when moving between sections or pages.
- Six cross-faded scenes — home (`hero.mp4`), destinations, culture, leadership, development team and
  gallery — each with its own poster frame. Scene changes stage the incoming film in an idle player,
  fade only when it can play, then pause the outgoing one, so only one film decodes at a time.
- All scenes are muted, looped, `playsInline`, responsive, poster-backed and dark-overlaid, with a
  reduced-motion / `saveData` poster-only path, a pause/mute control and an `aria-hidden` layer.
- Rwanda-inspired **custom cursor** (gold bead + trailing ring) that reacts to links, buttons, cards
  and images; disabled for touch/coarse pointers and reduced-motion users, who keep the native cursor.
- Scroll progress indicator, reveal animations, glassmorphism navigation, mobile drawer, search and
  notifications.
- **Five selectable colour themes** — Rwanda Emerald (default), Volcano Dusk, Lake Kivu, Savanna
  Gold and Amahoro Violet — from the palette control in the header. The choice is stored in the
  `vr_theme` cookie and rendered server-side onto `<html data-theme>`, so the first paint is already
  correct and switching is instant with no reload. Every theme only overrides the shared palette
  variables in `app/globals.css`, so navigation, footer, cards, buttons and forms all follow it.
- Homepage, destinations directory with search/filters, destination profiles, culture & heritage
  index and institution pages, tourism services directory, national park team directories,
  destination representatives with filters, gallery, articles, about/leadership, development team.
- **Contact page** (`/contact`) with official tourism channels, guidance before writing and an
  enquiry form that returns a reference (`ENQ-YYYYMMDD-XXXXX`) and emails a copy to the visitor.
- All data comes from PostgreSQL — no hardcoded front-end booking or price data.

### Cinematic scene system
- Route-aware scenes (`lib/video-scenes.ts`): `/` → home, `/destinations` and park/service pages →
  destinations, `/culture` → culture, `/about`, `/representatives`, `/contact` → leadership,
  `/development-team` → developers, `/gallery` and `/articles` → gallery.
- Every destination hero and the development-team page can override the scene film; the
  destination record's `videoUrl` field is used when an administrator sets one.
- The film map is resolved server-side (`lib/videos.ts`) from the `video_assets` table, so
  administrator changes apply to the public site without a deploy, with the shipped defaults as a
  fallback if the table is empty or a film is disabled.

### Booking
- The main **Book** action opens `/booking` directly; visitors explore destinations, activities,
  contacts and prices **without an account**.
- "Book this destination" asks for **Sign in or Create account** only when needed, preserving the
  destination through `?destination=<slug>&book=1` and returning the visitor to the booking form.
- Visitor category (international, resident, African, East African, Rwandan), dates, adults/children,
  activity, additional requests, live summary and confirmation reference (`VR-YYYYMMDD-XXXXX`).
- **Totals are computed on the server** from database price rows; a tampered `totalPrice` in the
  request is ignored (verified in testing).

### Accounts
- Registration with full name, email, telephone, password + confirmation, date of birth,
  nationality, optional national ID, profile picture upload.
- Email/telephone uniqueness checks, scrypt password hashing, optional national ID stored but never
  returned to any client, protected profile updates.
- Login with **email or telephone**, remember-me session, sign out, password reset by token.
- Dashboard: profile picture, personal details, national ID status (provided / not provided),
  account creation date, booking history with references, pending/approved/rejected counts, cancel
  pending requests, profile updates and secure password change.

### Administration
- Separate role-based dashboard (`/admin`) accessible only to `role = admin`.
- Overview: registered users, destinations, people, booking totals by status, recent requests and an
  inbox of new bookings.
- Bookings: search/filter, full visitor contact details, approve/reject/reset with a note, automatic
  visitor email and audit trail.
- **Enquiries inbox** (`/admin/messages`): every contact-page message with new/read/replied/closed
  status, search, a stored reply and one-click email reply to the visitor. Messages are kept as an
  audit record and cannot be deleted.
- **Visitor accounts** (`/admin/users`): every registered account with search by name, email or
  telephone, booking-request counts, and a per-account profile (`/admin/users/[id]`) with registration
  details and the visitor's full booking history. Passwords and identity numbers are excluded from
  the query, so they never reach the page. The whole administrator area is additionally gated by
  `middleware.ts`, which requires a signed session cookie before any admin page is rendered.
- Destinations and **official prices**: source name, source URL, verification date, verified flag.
  Unverified prices never reach the public site.
- People & teams: tourism leadership, park teams, heritage teams, representatives, developers.
- **Background films** (`/admin/videos`): per-section preview, upload or replace the film, upload a
  poster frame, retitle, describe, reorder, enable/disable and revert to the shipped default.
- Cultural institutions, tourism services, articles, gallery, welcome copy and contact settings.
- Media uploads (JPEG/PNG/WebP/GIF ≤ 4 MB; MP4/WebM background films ≤ 24 MB) stored in the database
  and served with immutable caching.

---

## Developer portraits and scene films

The development-team page (`/development-team`) matches portraits **by developer name**, never by card
position, so a photograph can never be attached to the wrong person:

| Developer | Portrait file |
| --- | --- |
| TR Ndikumana Eric | `public/media/team/tr-ndikumana-eric.jpg` |
| Byiringiro Aime Pacifique | `public/media/team/byiringiro-aime-pacifique.jpg` |
| Bwigwi Beramy Herve | `public/media/team/bwigwi-beramy-herve.jpg` |

Save the supplied photographs at those exact paths (JPG or PNG, at least 900 px wide,
head-and-shoulders) and they appear on the next request — no code change is needed. A portrait uploaded
for a person in **Admin → People & teams** takes precedence over the file. Until a file exists the card
shows a framed, labelled *Portrait pending* panel; the platform never substitutes a stock photograph.

Rebuild the cinematic scenes after changing the underlying photography:

```bash
node scripts/build-scene-videos.mjs                      # all six scenes
node scripts/build-scene-videos.mjs destinations culture  # selected scenes
```

The four tourism scenes are original Ken Burns edits of the licensed photographs in `public/media/`; the
development scene is a generated abstract motion graphic (emerald gradients, gold light sweeps, data
grid). Set `FFMPEG_PATH` if `ffmpeg` is not on `PATH`.

---

## Official price policy

A price is displayed publicly only when **all** of the following are true: it is marked verified,
it has a source URL, and it has a verification date. The UI shows the source link and the date.
Otherwise the destination displays:

> Price not officially verified — contact the destination for current pricing.

Seeded verified prices (checked 18 November 2026):

| Destination | Item | Source |
| --- | --- | --- |
| Volcanoes NP | Gorilla permit (international $1,500, resident $500, Rwandan/EAC $200, African $500) | RDB booking portal |
| Akagera NP | Park entry 2026–2027 by visitor category | Akagera Management Company official PDF |
| Nyungwe NP | Entry, chimpanzee, canopy walkway, colobus, birding | Nyungwe official 2025/2026 rate card |

Everything else (Gishwati-Mukura, Lake Kivu, Kigali, museums) intentionally has **no** published
figure until an official source is added by an administrator.

Named officials are published only with an official reference (RDB senior management page, RCHA
about page). Where an individual staff member cannot be verified, the destination shows the verified
**department/team** instead of an invented person. Official portraits are not reproduced without a
supplied image.

---

## Deployment (Vercel + hosted PostgreSQL)

1. Create a PostgreSQL database (Neon, Supabase, Vercel Postgres, RDS…).
2. Apply migrations and seed against it:
   ```bash
   DATABASE_URL="postgres://…" npm run db:migrate
   DATABASE_URL="postgres://…" npm run db:seed
   ```
3. Import the repository into Vercel and set the environment variables listed above.
4. Create the administrator with `npm run admin:create` pointing at the production `DATABASE_URL`,
   or run the script once with `ADMIN_*` set.
5. Deploy. No build-time database access is required; every data page is dynamically rendered.

Notes:
- `NEXT_PUBLIC_SITE_URL` must be the real public origin in production (for example
  `https://www.visitrwanda.example`), never `http://localhost:3000`: it is what `sitemap.xml`,
  `robots.txt` and password-reset emails point at. Both metadata routes are rendered per request,
  so changing the variable takes effect on the next request after the server restarts.
- For local/cloud development, set it to the origin of the running dev server. In this workspace it
  is the chat preview host, `https://pv-a806633e925c-0a1c1443-8d01-45d0-92b1-404e3d7e5272.style.dev`
  (in `.env.local` only — never commit it). That preview hostname is regenerated when the workspace
  is restored, so update the value when it changes.
- `DATABASE_URL` must be set in production. The embedded PGlite path is a local development
  convenience and does not provide durable storage on serverless platforms.
- Email is optional. Without `RESEND_API_KEY`, booking and status emails are logged server-side and
  recorded in the administrator inbox so nothing is silently lost.
- Uploaded images live in PostgreSQL in this implementation. For very large media libraries, add an
  object store (S3/R2) and swap `lib/upload.ts`; the rest of the application is unchanged.

---

## Project structure

```
app/                     routes: public pages, auth, dashboard, admin, API handlers
components/site/         cinematic layer, scene setter, brand mark, navigation, footer, cursor,
                         developer portraits, cards, price table
components/booking/      booking experience (search → destination → form → confirmation)
components/auth/         login, registration, reset forms
components/account/      visitor dashboard
components/admin/        admin navigation, resource manager, bookings manager
lib/db/                  Drizzle schema, connection (Pg + PGlite), seed
lib/auth.ts              sessions, cookies, safe user projection
lib/password.ts          scrypt hashing/verification
lib/pricing.ts           visitor categories, price quoting, formatting
lib/video-scenes.ts      scene registry and route → scene map
lib/videos.ts            server-side scene resolution from the database
lib/developers.ts        developer portrait paths and server-side file resolution
lib/validation.ts        Zod schemas shared by APIs
lib/admin-api.ts         admin resource tables, sanitisation, guards
drizzle/                 generated SQL migrations
scripts/                 seed, migrate, create-admin, media fetch, scene-video build
public/media/            photography and the six scene films
public/media/team/       supplied developer portraits (see below)
```

---

## Verification performed

- `npx tsc --noEmit` — clean.
- `npm run build` — production build succeeds (all routes compiled).
- API flows exercised against a running server: registration, duplicate rejection, email login,
  telephone login, profile update, password change, password reset, booking submission, price
  tampering attempt, administrator login, admin booking approval and visitor email, admin-only API
  returning 403 for a normal user, unverified price staying off the public site.
- Public routes return HTTP 200 (home, booking, destinations, destination profile, culture,
  institution, national parks, representatives, development team, articles, services, gallery, about,
  auth pages, all admin pages).
- Background films: `video_assets` migration applied on the local database, six default films seeded,
  `/api/admin/videos` returns them to an administrator, `/admin/videos` renders, and `/media/*.mp4`
  serves `video/mp4` with HTTP range support (206).
- Responsive behaviour was implemented with mobile-first layouts and verified by build/SSR only; it
  was **not** visually inspected in a browser during this session.

## Known limitations

- No developer portrait files were present in the workspace, so the three developer cards show the
  labelled *Portrait pending* state until the owner saves the photographs at the paths above. No image
  was generated, invented or borrowed for a real person.
- Background films are cinematic edits of still photography plus one generated abstract technology
  scene; they are not licensed Rwanda tourism footage, and the admin panel allows a real film to be
  uploaded per section at any time.
- Only the three destinations with official published rates show prices; the rest honestly show the
  “not officially verified” notice.
- Email delivery requires a Resend key; local runs log the messages and password-reset links.
- Photography is openly licensed from Wikimedia Commons (see `MEDIA_CREDITS.md`).
