import React from "react";
import { MotionConfig } from "framer-motion";
import { Instagram, ArrowUpRightSquare } from "lucide-react";
import { BentoGrid } from "./bento/BentoGrid";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { SectionHeading } from "../SectionHeading";
import { AlponaDivider } from "../AlponaDivider";

const partners = [
  {
    name: "VABS",
    src: "/images/orgs/vabs.webp",
    url: "https://www.instagram.com/vandy.bengalis/",
    scale: 1.5,
    isInstagram: true,
  },
  {
    name: "PSA",
    src: "/images/orgs/psa.webp",
    url: "https://www.instagram.com/vandypsa/",
    scale: 1.2,
    isInstagram: true,
  },
  {
    name: "SACE",
    src: "/images/orgs/sace.jpeg",
    url: "https://www.instagram.com/vanderbiltsace/",
    scale: 1.3,
    isInstagram: true,
  },
  {
    name: "Spevents",
    src: "/images/orgs/spevents.svg",
    url: "https://spevents.github.io",
    scale: 0.9,
    isInstagram: false,
  },
];

export default function PastEventShowcase() {
  // Snappy reveal: trigger as soon as the section nears the viewport and
  // resolve quickly — the hook's 0.8s/0.15s defaults were tuned for the old
  // splash-screen era and made this section feel slow to appear.
  const sectionRef = useScrollReveal({
    y: 20,
    duration: 0.4,
    stagger: 0.08,
    start: "top 95%",
  });

  return (
    // reducedMotion="user": the legacy bento grid's framer animations respect
    // the OS prefers-reduced-motion setting. Lives here (lazy chunk) instead
    // of App so framer-motion stays out of the eager entry bundle.
    <MotionConfig reducedMotion="user">
      <section id="past-events" className="py-16 md:py-20 px-4">
        {/* Soft separator into the archive */}
        <div className="max-w-3xl mx-auto mb-12 md:mb-16 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div ref={sectionRef} className="max-w-7xl mx-auto">
          {/* Section header */}
          <div data-reveal className="mb-8">
            <SectionHeading
              index="০৩"
              label="From the Archive"
              title={
                <span
                  className="motion-safe:animate-gradient-pan"
                  style={{
                    background:
                      "linear-gradient(90deg, #bf9b30, #e36414, #bf9b30)",
                    backgroundSize: "200% auto",
                    color: "transparent",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  Mock Shaadi 2025
                </span>
              }
              accent="Where tradition meets tomorrow — relive the night"
              align="left"
            />

            <AlponaDivider className="mx-auto mt-8 opacity-80" />

            {/* Presented by + partner orgs */}
            <div className="mt-6 text-center">
              <p className="text-almond/70 text-xs font-quattrocento tracking-wider uppercase mb-3">
                Presented by Vanderbilt University South Asian Organizations
              </p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 md:gap-x-6 max-w-md mx-auto">
                {partners.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-1.5 hover:scale-[1.08] active:scale-95 transition-transform duration-200"
                  >
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-[#992b0d]/10 backdrop-blur-sm">
                      <img
                        src={p.src}
                        alt={p.name}
                        className="w-full h-full object-contain p-1.5"
                        style={{ scale: p.scale }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {p.isInstagram ? (
                          <Instagram className="w-5 h-5 text-white" />
                        ) : (
                          <ArrowUpRightSquare className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                    <span className="text-[#e2d57e] text-xs font-quattrocento font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                      {p.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Existing BentoGrid -- preserved exactly as-is */}
          <div data-reveal>
            <BentoGrid />
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
