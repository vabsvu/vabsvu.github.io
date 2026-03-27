# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for **VABS** (Vanderbilt Association of Bengali Students). Currently built as a single-page event promotion site for "Mock Shaadi 2025" — being transitioned to a general club website. Deployed to GitHub Pages at https://vabsvu.github.io.

## Build & Development

Uses **pnpm** as the package manager.

```bash
pnpm dev           # Start Vite dev server
pnpm build         # Production build (outputs to dist/)
pnpm preview       # Preview production build
pnpm lint          # ESLint
pnpm deploy        # Build + deploy to GitHub Pages via gh-pages
```

Deployment uses `gh-pages` to push the `dist/` directory to the `gh-pages` branch.

## Tech Stack

- **React 18** with TypeScript (`.tsx` files)
- **Vite** for bundling (builds to `dist/`)
- **Tailwind CSS 3** with custom theme (PostCSS + Autoprefixer)
- **Framer Motion** for animations
- **Three.js** via `@react-three/fiber` + `@react-three/drei` for the 3D thali model
- **Embla Carousel** for image carousels
- **Lucide React** for icons

## Architecture

Single-page app with no routing. Code-split into 3 chunks via `React.lazy`:

```
App.tsx
  ErrorBoundary
  OpeningSequence         # Entry point — 4s splash screen, then reveals content
    AnimatedBorder        # Scroll-driven SVG henna border around entire page
    OrgHeader             # Top bar with org logos + AnimatedTitle
    BentoGrid (lazy)      # Main content grid layout — loads after splash
      AnimatedSLC         # "SLC Ballroom" event card
      AnimatedFood        # 3D thali model (Three.js Canvas)
      VideoPlayer         # Embedded skit video with BoxHover 3D tilt
      ShinyLakshyaBentoBox  # Lakshya image with glow effects
      AnimatedHolud       # "Holud Night" event card with HennaPatterns
    OrgShowcase (lazy)    # Embla carousel of VABS Instagram posts
```

**BentoBox** (`AnimatedNoise.tsx`) is the shared container component — provides gradient backgrounds with SVG noise overlays.

## Asset Locations

- **Images**: `public/images/` (WebP format for photos, SVG for logos)
- **3D Models**: `public/models/thali/` (GLTF + WebP textures)
- **Video**: `public/video/`
- **Favicon**: `public/vabs.svg`

Images are served from `public/` (not bundled). Use `/images/...` paths in code.

## Custom Tailwind Theme

Defined in `tailwind.config.js`:

- **Colors:** `tyrian`, `carmine`, `spanish`, `gold`, `almond` (South Asian wedding palette)
- **Fonts:** `quattrocento` (serif), `anonymous` (mono), `instrumentSerif`
- **Animations:** `marquee`/`marqueeReverse` for scrolling text, `pulse-scale`/`pulse-line` for decorative CSS animations

## Key Patterns

- The opening sequence locks scroll for 4 seconds, then fades out and reveals content with a 1.5s delay
- `BoxHover` implements a 3D mouse-tracking tilt effect (disabled on mobile via touch detection)
- `useIsVisible` hook (`src/hooks/useIsVisible.ts`) gates animations via IntersectionObserver — all animation-heavy components pause when off-screen
- The 3D thali model (`model_components/Thali.tsx`) uses memoized textures and materials with proper disposal on unmount
- Simple decorative animations (pulsing lines/dots) use CSS `@keyframes` instead of Framer Motion to run on the compositor thread
