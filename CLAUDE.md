# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for **VABS** (Vanderbilt Association of Bengali Students). A general club site with an auto-updating events calendar and Instagram feed; the former "Mock Shaadi 2025" promo page lives on as the Past Events section. Deployed to GitHub Pages at https://vabsvu.github.io.

## Build & Development

Uses **pnpm** as the package manager.

```bash
pnpm dev              # Start Vite dev server
pnpm build            # Production build (outputs to dist/)
pnpm preview          # Preview production build
pnpm lint             # ESLint (note: only covers .js/.jsx — .tsx is NOT linted or typechecked; no tsconfig exists)
pnpm sync:instagram   # Refresh public/data/*.json from Instagram (see docs/INSTAGRAM_SYNC.md)
```

## Deployment

**Push to `main` deploys the site.** `.github/workflows/deploy.yml` builds with pnpm and publishes `dist/` via `actions/deploy-pages` (Pages must be set to "GitHub Actions" source; the workflow's `configure-pages` step enables this itself on first run). The old `pnpm deploy` / `gh-pages` branch flow is dead — do not use it; Pages serving the raw `main` branch was the cause of a blank white live site.

## Auto-updating content

The site is data-driven from `public/data/`:

- `events.json` — calendar events (`CalendarEvent[]`, see `src/types/events.ts`). Events with ids starting `ig_` are machine-generated from Instagram captions; all other ids are manually curated and never touched by the sync.
- `posts.json` — Instagram posts; images are downloaded to `public/images/insta/` (IG CDN URLs expire, never hotlink).

`.github/workflows/sync-instagram.yml` (cron, twice daily) runs `scripts/sync-instagram.mjs` (zero-dependency Node), commits changes, and calls the deploy workflow (`workflow_call` — GITHUB_TOKEN pushes don't trigger `push:` workflows). The script's invariant: any failure exits 0 with zero file writes. Source priority: `IG_ACCESS_TOKEN` (Graph API) → `BEHOLD_FEED_URL` → public endpoint (usually blocked from CI). Officer setup docs: `docs/INSTAGRAM_SYNC.md`.

## Tech Stack

- **React 18** with TypeScript (`.tsx` files, esbuild-transpiled — no typechecking)
- **Vite 6** for bundling
- **Tailwind CSS 3** with custom theme
- **GSAP** (`@gsap/react` `useGSAP` + ScrollTrigger) for entrance/scroll animations
- **Framer Motion** for panel/modal transitions (calendar) and the legacy bento grid
- **Three.js** via `@react-three/fiber` + `@react-three/drei` for the 3D thali model
- **Embla Carousel** for the Instagram feed
- **Lucide React** for icons

## Architecture

Single-page app, no routing:

```
App.tsx                     # Last-resort ErrorBoundary (full-page styled fallback)
  SiteLayout
    AnimatedBorder          # GSAP-drawn SVG henna border (fixed, behind content)
    Navbar                  # Anchor links; solidifies after 40px scroll
    HeroSection             # Logo, Bengali proverb, next-event CTA from events.json
    EventsCalendar (lazy)   # Partiful-style calendar — src/components/calendar/
    InstagramFeed (lazy)    # Embla carousel fed by posts.json
    PastEventShowcase (lazy)# Wraps the legacy Mock Shaadi BentoGrid (3D thali, video)
    Footer
```

Each lazy section has its **own ErrorBoundary** — one section failing must never blank the page (this happened: a WebGL context failure once took down the whole site).

### Chunking (vite.config.js — treat as fragile)

`manualChunks` is a **function** keeping `react` + `gsap` + Vite's preload helper eager, and `three` (~950 kB) + `framer` lazy-only. The object form silently mis-assigns React into the three chunk and drags ~1 MB into the initial load — verify with `grep -oE 'from"\./[^"]+"' dist/assets/index-*.js` after touching it (entry must import only react/gsap chunks).

### Calendar (src/components/calendar/)

`useCalendar` (month state, selectedDate, event lookups by YYYY-MM-DD string — avoid Date timezone math) → `CalendarGrid`/`CalendarDay` (photo thumbnails with deterministic tilt on event days) → `DayDetailPanel` (chevrons jump to nearest event day across months) → shared `EventCard` → `EventModal`. Date formatting lives in `calendar/formatters.ts`.

### Resilience patterns

- `index.html` paints the brand gradient + a CSS loader pre-JS (never a white page; React replaces it on mount)
- `AnimatedFood` probes WebGL support (module-level memoized) and renders a static plate image when unavailable; the Canvas lazy-mounts via `useIsVisible` and pauses (`frameloop="never"`) off-screen
- `VideoPlayer` uses `preload="none"` + poster — the 9.5 MB mp4 loads only on play
- `useScrollReveal` respects `prefers-reduced-motion` (gsap.matchMedia) and force-resolves visibility for elements above the viewport — content must never be stuck at `opacity: 0`

## Asset Locations

- **Images**: `public/images/` (WebP; `public/images/insta/ig_*.jpg` are sync-downloaded — don't hand-edit)
- **3D Models**: `public/models/thali/` (GLTF + WebP textures)
- **Video**: `public/video/`
- **Favicon**: `public/vabs.svg`

Images are served from `public/` (not bundled). Use `/images/...` paths in code.

## Custom Tailwind Theme

Defined in `tailwind.config.js`:

- **Colors:** `tyrian`, `carmine`, `spanish`, `gold`, `almond` (South Asian wedding palette)
- **Fonts:** `quattrocento` (serif), `anonymous` (mono), `instrumentSerif`; Tiro Bangla (Google Fonts) for Bengali text
- **Animations:** `marquee`/`marqueeReverse`, `pulse-scale`/`pulse-line`, `gradient-pan`
- **Screens:** `touch` raw variant (`hover: none`) for touch-only styles
