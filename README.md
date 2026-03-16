# Lemontree Volunteers

A full-stack Next.js volunteer coordination platform: campaigns, flyer tracking, team chat, gamification (points, levels, badges), and an admin dashboard.

## Stack

- **Next.js** (App Router) + TypeScript
- **Supabase** — PostgreSQL, Auth (Google OAuth + Phone OTP via Twilio Verify), Realtime
- **NextAuth.js v5** — Google OAuth; phone OTP via Supabase + Twilio
- **Mapbox** (`react-map-gl`) — campaign maps, flyer pins
- **Tailwind CSS v4** — styling

## Getting started

### Prerequisites

- Node.js 18+
- npm (or yarn/pnpm)

### Install and run

```bash
git clone <repo-url>
cd Morgan_Stanley
npm install
```

Create `.env.local` and set the required variables (see **Environment variables** below).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build and start (production)

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Environment variables

Configure these in `.env.local` (or in Vercel / your host):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | App URL (e.g. `https://your-app.vercel.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `AUTH_SECRET` | NextAuth secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox access token |

Optional: `LEMONTREE_API_BASE` for external resources API (e.g. `https://platform.foodhelpline.org`).

## Admin dashboard

Users with `role = 'admin'` in the `volunteers` table can access `/admin`. The main nav shows an “Admin” link only for admins. The dashboard includes Overview, Users, Events, Resources, Storage, Logs, System Status, and Settings. All admin API routes enforce the admin role on the server.

## Deploy on Vercel

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Add the environment variables in the Vercel project settings.
3. Deploy; the build runs `npm run build`.

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
