# Tone — Lossless Audio Web Player & Backend API

Tone is an audiophile-grade, full-stack music workstation and streaming ecosystem featuring unlimited cloud storage via Telegram, studio-master audio playback, synchronized word-by-word lyrics, and seamless cross-platform syncing.

## Repository Architecture

This full-stack monorepo contains:
- **Web Frontend (`/src`)**: Next.js 16 (App Router), Tailwind CSS v4, Lucide icons, GSAP smooth scroll animations, and bit-perfect Web Audio engine.
- **Backend API (`/backend`)**: Express, TypeScript, Drizzle ORM, Supabase PostgreSQL, and Telegram Bot integration (`@tone_bot`).

## Quick Start

### 1. Frontend (Web Player)
```bash
# Install dependencies
npm install

# Run Next.js development server (http://localhost:3000)
npm run dev

# Compile production build
npm run build
```

### 2. Backend (API & Telegram Bot)
```bash
# Run backend development server with hot-reload (http://localhost:3001)
npm run backend:dev

# Run automated backend test suite
npm run backend:test

# Compile TypeScript backend
npm run backend:build
```

## Deployment

### Frontend (Vercel)
1. Import repository `capt-noah/tone-web` on [Vercel](https://vercel.com/new).
2. Root directory: `./`
3. Environment variables:
   - `NEXT_PUBLIC_BACKEND_URL`: Your live Render backend URL (e.g. `https://musicly-4l0y.onrender.com`).

### Backend (Render)
1. Connect repository `capt-noah/tone-web` to your Web Service on [Render](https://dashboard.render.com).
2. Root directory: `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Environment variables:
   - `DATABASE_URL`: Supabase PostgreSQL connection string.
   - `TELEGRAM_BOT_TOKEN`: Bot token from `@BotFather`.
   - `TELEGRAM_BOT_USERNAME`: `tone_bot` (or your custom bot handle).
