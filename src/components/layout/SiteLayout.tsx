import React, { Suspense, lazy, useEffect } from "react";
import AnimatedBorder from "../AnimatedBorder";
import { ErrorBoundary } from "../ErrorBoundary";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { HeroSection } from "../hero/HeroSection";

const EventsCalendar = lazy(
  () => import("../calendar/EventsCalendar"),
);
const InstagramFeed = lazy(() => import("../feed/InstagramFeed"));
const PastEventShowcase = lazy(
  () => import("../past-events/PastEventShowcase"),
);

function SectionNotice({ message }: { message: string }) {
  return (
    <div className="mx-auto my-10 max-w-md rounded-xl border border-gold/30 bg-black/20 p-5 text-center">
      <p className="font-quattrocento text-almond/90">{message}</p>
    </div>
  );
}

export default function SiteLayout() {
  // Deep links like /#events target lazy-loaded sections that don't exist
  // when the browser performs its initial hash scroll. Re-scroll until the
  // layout settles (later sections mounting and data fetches resolving keep
  // shifting the target) or the ~5s deadline passes. Cancel on first user
  // intent so the loop never fights the user; scrollIntoView is instant by
  // default, so repeated calls don't animate.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    window.addEventListener("wheel", cancel, { once: true });
    window.addEventListener("touchstart", cancel, { once: true });
    window.addEventListener("keydown", cancel, { once: true });
    const deadline = Date.now() + 5000;
    let lastTop: number | null = null;
    const tick = () => {
      if (cancelled || Date.now() > deadline) return;
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top !== lastTop) {
          lastTop = top;
          el.scrollIntoView();
        }
      }
      setTimeout(tick, 200);
    };
    tick();
    return () => {
      cancelled = true;
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, []);

  return (
    <AnimatedBorder className="min-h-screen bg-gradient-to-br from-[#992b0d] via-[#761f0a] to-[#4d1405] relative overflow-hidden">
      {/* Atmosphere — two static, fixed, non-interactive layers behind all
          content. Negative z keeps them under every in-flow section while
          still painting above AnimatedBorder's henna SVG (which sits at z-0
          in the root stacking context, below this z-1 content wrapper):
          page bg < henna border < vignette/glows < grain < content. */}
      <div
        aria-hidden="true"
        className="bg-vignette fixed inset-0 -z-10 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="bg-grain fixed inset-0 -z-10 pointer-events-none opacity-5 mix-blend-overlay"
      />

      <Navbar />

      <HeroSection />

      <ErrorBoundary
        label="events-calendar"
        fallback={
          <SectionNotice message="The events calendar couldn't load right now — check back soon." />
        }
      >
        <Suspense fallback={<div className="min-h-[640px] md:min-h-[850px]" />}>
          <EventsCalendar />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary label="instagram-feed" fallback={null}>
        <Suspense fallback={<div className="min-h-[620px] md:min-h-[750px]" />}>
          <InstagramFeed />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary label="past-event-showcase" fallback={null}>
        <Suspense
          fallback={
            // Lightweight on-palette skeleton loosely matching the past-events
            // bento layout. Same min-h as the section so there is no layout
            // shift when the real content swaps in.
            <div
              aria-hidden="true"
              className="min-h-[700px] md:min-h-[900px] px-4 py-16 md:py-20"
            >
              <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                <div className="mx-auto h-8 w-56 max-w-full rounded-2xl bg-white/5 motion-safe:animate-pulse" />
                <div className="h-[150px] md:h-[200px] rounded-2xl bg-white/5 motion-safe:animate-pulse" />
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="h-[150px] md:h-[200px] rounded-2xl bg-white/5 motion-safe:animate-pulse" />
                  <div className="h-[150px] md:h-[200px] rounded-2xl bg-white/5 motion-safe:animate-pulse" />
                </div>
              </div>
            </div>
          }
        >
          <PastEventShowcase />
        </Suspense>
      </ErrorBoundary>

      <Footer />
    </AnimatedBorder>
  );
}
