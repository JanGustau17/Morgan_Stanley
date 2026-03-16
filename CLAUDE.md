# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured. There is no single-test command.

## Architecture

This is **Lemontree Volunteers** — a full-stack Next.js volunteer coordination platform using the App Router.

### Stack
- **Next.js App Router** with TypeScript
- **Supabase** (PostgreSQL + Auth + Realtime) for all data and auth
- **NextAuth.js v5** (beta) for Google OAuth; phone OTP is handled directly via Supabase Auth
- **Mapbox GL JS** via `react-map-gl` for campaign maps and flyer pin tracking
- **TailwindCSS v4** for styling
- **Zod + React Hook Form** for form validation
- **Anthropic Claude SDK** (`@anthropic-ai/sdk`) for AI features
- **Path alias**: `@/*` → `src/*`

### Route Groups
- `(auth)` — login/signup pages (no main nav)
- `(main)` — all authenticated app pages with persistent nav bar
- `(main)/admin` — admin-only dashboard; layout in `src/app/(main)/admin/layout.tsx` checks `session.user.role === 'admin'` and redirects others. Sidebar: Overview, Users, Events, Resources, Storage, Logs, System Status, Settings. Frontend checks are insufficient; every admin API must call `requireAdmin()` from `src/lib/admin.ts`.

### Supabase Clients
- **Server**: `src/lib/supabase/server.ts` — `createServiceClient()` uses `SUPABASE_SERVICE_ROLE_KEY`, used in API routes and server components
- **Client**: `src/lib/supabase/client.ts` — `createClient()` uses the anon key, used in client components

### Database Tables
`volunteers`, `campaigns`, `campaign_volunteers` (junction), `flyer_pins` (map pin drops with coordinates), `conversions` (QR code scans via `ref_tag`), `point_events` (points audit log), `badges`, `messages` (Realtime-enabled chat). Full schema in `supabase/schema.sql`.

### Gamification
Points are awarded via `/api/points/award`. Levels (Seedling → Lemontree) are computed from total points in `src/lib/points.ts`. Streaks, badges, and a leaderboard (weekly + all-time) round out the system.

### Maps
Map components (`src/components/map/`) must be dynamically imported with `ssr: false` to avoid Mapbox SSR issues. EXIF parsing (`exifr`) extracts GPS coordinates from uploaded flyer photos.

### Authentication
`src/lib/auth.ts` configures NextAuth v5 with Google. Session includes `volunteerId` and `role` (from `volunteers` table). Phone OTP is handled via Supabase Auth + Twilio Verify; `src/app/api/auth/phone-session/route.ts` issues the NextAuth session after OTP verification. The `volunteers` table is synced on first sign-in.

### Chat and message types
`Message` in `src/lib/types.ts` has optional `sender?: MessageSender`. `MessageSender` is `{ id, name, avatar_url }` — minimal fields for chat display. Full `Volunteer` rows from the DB are assignable to `MessageSender`. Use `MessageSender` (not `Volunteer`) for optimistic chat messages and anywhere only sender display is needed.

### Resources
Resources are fetched from an external API. Set `LEMONTREE_API_BASE` (e.g. `https://platform.foodhelpline.org`) for the resources API; there is no local resources table. Admin Resources page is informational only.

### Build and Next.js config
`next.config.ts` sets `turbopack.root` to the project directory so the correct `node_modules` is used when multiple lockfiles exist. `serverExternalPackages: ["html2canvas", "jspdf"]` avoids bundling issues for PDF export in `FlyerStep.tsx`. Optional: add `"type": "module"` to `package.json` to silence the tailwind.config ESM warning on Vercel.

### Environment Variables
```
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_MAPBOX_TOKEN
```
