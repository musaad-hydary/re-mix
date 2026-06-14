# Re//Mix

Re//Mix is a music discovery app that surfaces sample relationships between songs. Click "Inspire Me" to see a track and the original recording it sampled, paired with album art and quick links to listen, read lyrics, or learn more about the connection.

Live site: https://re-mix-nine.vercel.app

## How it works

The app is split into a React frontend and an Express backend.

The frontend (Vite, React, TypeScript, Tailwind) renders a split disc graphic showing the "original" track on one half and the "flip" (the track that sampled it) on the other. Album art is pulled from the iTunes Search API and rendered with a halftone overlay for a printed, retro feel.

The backend (Express) serves a curated pool of verified sample pairs from a local JSON file (pool-cache.json), so the core "Inspire Me" feature works reliably without depending on external rate limits. It also proxies a few endpoints to the WhoSampled API (via Parse) for search and track lookups, and to the iTunes Search API for artwork, with response caching to reduce repeat calls.

## Why a curated pool?

Sample data APIs are rate limited and not built for high traffic. Rather than have the core experience depend on a third party API being available at the moment a visitor loads the page, the app ships with a pre-built dataset of well documented sample relationships. This keeps the main interaction instant and reliable, while still allowing live lookups for anything not already in the pool.

## Stack

Frontend: React, TypeScript, Vite, Tailwind CSS, Zustand
Backend: Express, Node, TypeScript
Data sources: WhoSampled API (via Parse), iTunes Search API
Hosting: Vercel (frontend), Render (backend)

## Running locally

Backend

```
cd server
npm install
npm run dev
```

Frontend

```
npm install
npm run dev
```

Set VITE_API_URL in a .env.local file to point at your local backend, for example:

```
VITE_API_URL=http://localhost:3001/api/samples
```
