# Sound Track, Anytime

Your Spotify stats — top tracks, top artists, genre breakdown, and a
one-click playlist built from your own history — without waiting for
December.

Built with Next.js (App Router), NextAuth (Auth.js), the Spotify Web API,
Tailwind CSS, and Recharts.

## Features

- Sign in with Spotify (OAuth via NextAuth)
- Top tracks & top artists, toggle between last 4 weeks / 6 months / all time
- Genre breakdown chart, aggregated from your top artists
- One-click playlist generator that writes a real playlist to your account
- Downloadable "share card" image (rendered client-side, no server needed)

## Why no audio-feature "mood" analysis?

Spotify deprecated the Audio Features, Audio Analysis, and Recommendations
endpoints for all new developer apps in November 2024. Those used to power
tempo/energy/danceability style features. This app only relies on endpoints
that are still available for new apps: top items, profile, and playlist
read/write.

## Setup

### 1. Register a Spotify app

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   (requires a Spotify Premium account as of 2026).
2. Create an app. Check **Web API** under "Which API/SDKs are you planning to use?"
3. Add this redirect URI:
   ```
   http://127.0.0.1:3000/api/auth/callback/spotify
   ```
4. Copy your **Client ID** and **Client Secret**.

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
AUTH_SECRET=...          # generate with: npx auth secret
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open **http://127.0.0.1:3000** (not `localhost` — Spotify requires the
literal loopback IP for local redirect URIs).

## Deploying

1. Push to GitHub, import into [Vercel](https://vercel.com).
2. Add the same three environment variables in the Vercel project settings.
3. Add a second redirect URI in the Spotify dashboard for your production
   domain: `https://your-app.vercel.app/api/auth/callback/spotify`.

## Project structure

```
src/
  auth.ts                     NextAuth config (Spotify provider + token refresh)
  lib/spotify.ts               Thin Spotify Web API client
  app/
    page.tsx                   Landing / sign-in page
    dashboard/page.tsx          Main stats dashboard
    api/auth/[...nextauth]/     NextAuth route handler
    api/playlist/               Playlist generation endpoint
  components/
    TimeRangeToggle.tsx
    GenreChart.tsx
    PlaylistButton.tsx
    ShareCard.tsx
```

## Ideas for extending this

- Save snapshots of top tracks/artists to a database (Postgres/Supabase) so
  you get *real* year-over-year comparisons instead of just short/medium/long term.
- Add an LLM-powered "roast my taste" feature using your top genres/artists as input.
- Add a public share page so friends can view (not edit) your stats via a link.
