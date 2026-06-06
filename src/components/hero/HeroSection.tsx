import React, { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CalendarDays } from "lucide-react";
import type { CalendarEvent, EventsData } from "../../types/events";

gsap.registerPlugin(useGSAP);

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetch("/data/events.json")
      .then((r) => r.json())
      .then((data: EventsData) => {
        // Local calendar date (NOT toISOString, which is UTC and rolls over
        // to tomorrow every evening US Central) — matches useCalendar.ts.
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0",
        )}-${String(d.getDate()).padStart(2, "0")}`;
        const upcoming = data.events
          .filter((e) => e.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date));
        if (upcoming.length > 0) setNextEvent(upcoming[0]);
      })
      .catch(() => {});
  }, []);

  // Staggered entrance timeline — left column rises in sequence, the
  // proverb block slides in from the right, the watermark fades to rest.
  useGSAP(
    () => {
      // Reduced motion: all tweens below are from-tweens, so skipping
      // them leaves the content in its natural, fully visible state.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-watermark", { opacity: 0, duration: 0.7 })
        .fromTo(
          ".hero-logo",
          { scale: 0.92, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6 },
          "-=0.55",
        )
        .from(".hero-eyebrow", { y: 14, opacity: 0, duration: 0.5 }, "-=0.35")
        .from(".hero-title", { y: 26, opacity: 0, duration: 0.6 }, "-=0.3")
        .from(".hero-subtitle", { y: 18, opacity: 0, duration: 0.5 }, "-=0.35")
        .from(".hero-mission", { y: 16, opacity: 0, duration: 0.5 }, "-=0.3")
        .from(".hero-proverb", { x: 28, opacity: 0, duration: 0.7 }, "-=0.45");
    },
    { scope: containerRef },
  );

  // Animate CTA when event data loads
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      if (nextEvent) {
        gsap.from(".hero-cta", {
          y: 10,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      }
    },
    { scope: containerRef, dependencies: [nextEvent] },
  );

  const formatDate = (date: string, time?: string) => {
    const d = new Date(date + "T00:00:00");
    const dateStr = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (!time) return dateStr;
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${dateStr} at ${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center px-4 pt-28 pb-10 md:pt-24 md:pb-16 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(227,100,20,0.12),_transparent_60%)]" />

      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-y-8 md:gap-y-6 md:gap-x-10 items-center"
      >
        {/* Giant Bengali glyph watermark behind the right column */}
        <span
          aria-hidden="true"
          className="hero-watermark pointer-events-none select-none absolute -z-10 top-1/2 right-0 md:-right-10 -translate-y-1/2 rotate-[8deg] font-['Tiro_Bangla'] leading-none text-[20rem] md:text-[28rem] text-almond/[0.04]"
        >
          ব
        </span>

        {/* Left column — masthead */}
        <div className="md:col-span-7">
          {/* Logo — sized at its final dimensions; the asset's internal
              padding is cropped by the wrapper instead of an animated
              overscale, so the entrance tween can settle at scale: 1 */}
          <div className="hero-logo w-16 h-16 rounded-full overflow-hidden mb-5">
            <img
              src="/images/orgs/vabs.webp"
              alt="VABS"
              className="w-full h-full object-contain scale-150"
            />
          </div>

          {/* Eyebrow */}
          <div className="hero-eyebrow flex items-center gap-3 mb-3">
            <span className="h-px w-12 bg-gold/40" aria-hidden="true" />
            <span className="font-quattrocento uppercase tracking-[0.3em] text-xs text-gold-light/80">
              Vanderbilt University
            </span>
          </div>

          {/* Club name */}
          <h1
            className="hero-title text-7xl md:text-8xl lg:text-9xl font-quattrocento font-bold tracking-tight leading-none mb-3 md:mb-4 motion-safe:animate-gradient-pan"
            style={{
              background:
                "linear-gradient(90deg, #bf9b30, #e36414, #bf9b30)",
              backgroundSize: "200% auto",
              color: "transparent",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
            }}
          >
            VABS
          </h1>

          <p className="hero-subtitle font-instrumentSerif italic text-xl md:text-2xl text-almond/85">
            Vanderbilt Association of Bengali Students
          </p>
        </div>

        {/* Right column — Bengali proverb as display type */}
        <div className="md:col-span-5 md:row-span-2 md:self-center md:justify-self-end">
          <div className="hero-proverb border-l border-gold/40 pl-5 md:pl-6">
            <p
              lang="bn"
              className="font-['Tiro_Bangla'] text-3xl md:text-4xl lg:text-5xl leading-snug text-almond"
            >
              ভালো হৃদয়ের
              <br />
              কোনো দোষ নেই
            </p>
            <p className="font-instrumentSerif italic text-gold-light text-base mt-3">
              "A good heart has no faults."
            </p>
          </div>
        </div>

        {/* Left column — mission + next event */}
        <div className="md:col-span-7">
          <p className="hero-mission font-quattrocento text-almond/70 text-sm md:text-base max-w-md">
            Celebrating Bengali culture, building community, and sharing
            traditions at Vanderbilt University.
          </p>

          {/* Next event teaser */}
          {nextEvent && (
            <button
              onClick={() =>
                document.querySelector("#events")?.scrollIntoView({
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches
                    ? "auto"
                    : "smooth",
                })
              }
              className="hero-cta mt-6 md:mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-sm border border-gold-light/40 bg-tyrian/30 backdrop-blur-sm hover:border-gold-light/80 hover:bg-gold-light/5 transition-all duration-300 group"
            >
              <CalendarDays className="w-5 h-5 text-gold-light" />
              <div className="text-left">
                <p className="text-almond text-sm font-quattrocento font-bold">
                  {nextEvent.title}
                </p>
                <p className="text-almond/70 text-xs font-quattrocento">
                  {formatDate(nextEvent.date, nextEvent.startTime)}
                  {nextEvent.location && ` — ${nextEvent.location}`}
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
