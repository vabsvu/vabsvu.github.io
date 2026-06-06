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

  // Staggered entrance timeline
  useGSAP(
    () => {
      // Reduced motion: all tweens below are from-tweens, so skipping
      // them leaves the content in its natural, fully visible state.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-logo",
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8 },
      )
        .from(".hero-title", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-subtitle", { y: 15, opacity: 0, duration: 0.5 }, "-=0.3")
        .from(".hero-proverb", { opacity: 0, duration: 0.8 }, "-=0.2")
        .from(".hero-mission", { opacity: 0, duration: 0.7 }, "-=0.4")
        .from(
          ".hero-divider",
          { scaleX: 0, opacity: 0, duration: 0.5 },
          "-=0.2",
        );
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
      className="min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-10 md:pt-20 md:pb-16 relative"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(227,100,20,0.12),_transparent_60%)]" />

      <div
        ref={containerRef}
        className="relative z-10 text-center max-w-3xl mx-auto"
      >
        {/* Logo — sized at its final dimensions; the asset's internal
            padding is cropped by the wrapper instead of an animated
            overscale, so the entrance tween can settle at scale: 1 */}
        <div className="hero-logo w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden mx-auto mb-5 md:mb-6">
          <img
            src="/images/orgs/vabs.webp"
            alt="VABS"
            className="w-full h-full object-contain scale-150"
          />
        </div>

        {/* Club name */}
        <h1
          className="hero-title text-4xl sm:text-5xl md:text-6xl font-quattrocento font-bold tracking-tight mb-3 md:mb-4 motion-safe:animate-gradient-pan"
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

        <p className="hero-subtitle text-lg md:text-xl text-almond/80 font-quattrocento mb-2">
          Vanderbilt Association of Bengali Students
        </p>

        {/* Bengali proverb */}
        <div className="hero-proverb mt-5 md:mt-6 mb-2">
          <p className="text-2xl md:text-3xl font-['Tiro_Bangla'] text-almond/90">
            ভালো হৃদয়ের কোনো দোষ নেই
          </p>
          <p className="text-sm md:text-base italic text-gold-light mt-2 font-quattrocento">
            "A good heart has no faults."
          </p>
        </div>

        {/* Mission */}
        <p className="hero-mission text-almond/60 font-quattrocento mt-5 md:mt-6 text-sm md:text-base max-w-lg mx-auto">
          Celebrating Bengali culture, building community, and sharing
          traditions at Vanderbilt University.
        </p>

        {/* Decorative line */}
        <div className="hero-divider flex items-center justify-center gap-3 mt-6 md:mt-8">
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-gold to-transparent motion-safe:animate-pulse-line" />
          <div className="w-2 h-2 rounded-full bg-spanish motion-safe:animate-pulse-scale" />
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-gold to-transparent motion-safe:animate-pulse-line" />
        </div>

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
            className="hero-cta mt-8 md:mt-10 inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-carmine/30 to-spanish/20 border border-gold/20 backdrop-blur-sm hover:border-gold/40 hover:scale-[1.02] transition-all duration-200 group"
          >
            <CalendarDays className="w-5 h-5 text-gold" />
            <div className="text-left">
              <p className="text-almond text-sm font-quattrocento font-bold">
                {nextEvent.title}
              </p>
              <p className="text-almond/60 text-xs font-quattrocento">
                {formatDate(nextEvent.date, nextEvent.startTime)}
                {nextEvent.location && ` — ${nextEvent.location}`}
              </p>
            </div>
          </button>
        )}
      </div>
    </section>
  );
}
