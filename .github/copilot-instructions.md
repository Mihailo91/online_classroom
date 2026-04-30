# Copilot Instructions — Online Language School Platform

For technical implementation details, see tach_specification.md
For business context and requirements, see @docs/task_definition.md

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 19+ (App Router) |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon/Supabase) |
| ORM | Prisma |
| Auth | NextAuth.js v5 — JWT strategy, Credentials provider |
| Payments | PayPal Orders API v2 |
| Video | Vimeo Pro (embedded player + `@vimeo/player` SDK) |
| PDF | React-PDF or Puppeteer (invoices) |
| Deployment | Vercel |

## Architecture Overview

This is a **greenfield Next.js 19 App Router** project. All architecture decisions are documented in `/docs/`.

- **Route structure maps to user roles**: `/dashboard/*` (student), `/professor/*` (professor), `/admin/*` (admin), public routes at root.
- **API routes live under `/app/api/`** as Next.js Route Handlers.
- **Role-based middleware** protects `/dashboard`, `/professor`, and `/admin` prefixes.
- **Pricing is per-professor**: prices are never stored on packages directly — always via the `professor_pricing` join table.
- **Payments flow**: Create PayPal order → redirect → capture → update DB. `paypal_order_id` is stored on `transactions`. Webhooks handled at `POST /api/webhooks/paypal`.
- **Video content** is never served by the platform — only Vimeo IDs/URLs are stored. All playback uses the Vimeo iframe embed.

## Build & Dev Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npx prisma migrate dev          # Run DB migrations (dev)
npx prisma migrate deploy       # Run DB migrations (production)
npx prisma studio               # Open DB browser GUI
```

## Key Conventions

### Database & Prisma
- All IDs are UUIDs.
- `remaining_lessons` on `student_packages` is a **generated column** (`total_lessons - used_lessons`) — never write to it directly.
- `student_package_id` is **nullable** on `lessons` (null = single class purchase).
- Package prices are always read from `professor_pricing`, not from `packages`.

### Business Rules (enforce server-side)
- **12-hour cancellation rule**: `scheduled_at - NOW() >= INTERVAL '12 hours'`. Late cancellations set `cancellation_type = 'late'` and increment `used_lessons`. Professor/Admin cancellations set `cancellation_type = 'by_professor'/'by_admin'` and never deduct lessons.
- **Package activation**: `activated_at = NOW()`, `expires_at = NOW() + validity_days` — set at payment capture time.
- **Single class** has no package (`validity_days = null`); the lesson must be booked at the time of purchase.

### Auth & Roles
- NextAuth.js v5 with JWT. Role (`student`, `professor`, `admin`) is embedded in the JWT and available via `session.user.role`.
- Use middleware to guard route prefixes — do not rely solely on client-side role checks.

### Vimeo Integration
- Store both `vimeo_video_id` (numeric string) and `vimeo_url` on `course_modules`.
- Extract the video ID from the URL server-side when admin pastes a Vimeo URL.
- Vimeo player SDK events to handle: `timeupdate` (debounced, save every 10s), `ended` (mark module complete), `pause` (save position).
- Player options: `autoplay: false`, `responsive: true`, `dnt: true`.
- Domain-locked embeds: Vimeo will refuse to load on any domain not whitelisted — use a dev domain or Vimeo embed exceptions locally.
- `VIMEO_ACCESS_TOKEN` env var is required for Vimeo API calls (metadata fetch, validation).

### PayPal
- Use sandbox (`PAYPAL_ENV=sandbox`) during development.
- Always verify webhook signatures before processing.
- `reference_type` + `reference_id` on `transactions` identify what was purchased (`package`, `single_lesson`, `course`, `group_class`).

### Performance
- Use **ISR** (Incremental Static Regeneration) for public-facing pages (`/`, `/courses`, `/courses/[id]`).
- Lazy-load Vimeo iframes (use `loading="lazy"` or intersection observer).
- Use connection pooling (PgBouncer or Neon's built-in pooler) — do not use direct DB connections in serverless functions.

## Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox            # or "production"
VIMEO_ACCESS_TOKEN=
VIMEO_ALLOWED_DOMAIN=
```

## Reference

Full technical specification: `/docs/Online Language School Platform — Technical Specification.md`
