import React from "react";
import { Instagram } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { handleAnchorClick } from "./Navbar";
import { AlponaDivider } from "../AlponaDivider";

const quickLinks = [
  { label: "Events", href: "#events" },
  { label: "Instagram", href: "#feed" },
  { label: "Mock Shaadi", href: "#past-events" },
];

export function Footer() {
  const footerRef = useScrollReveal({ y: 20 });
  const year = new Date().getFullYear();

  return (
    <footer className="bg-tyrian border-t border-gold/10 py-12 md:py-16 px-4">
      <div ref={footerRef} className="max-w-5xl mx-auto flex flex-col gap-10">
        {/* Colophon top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-center md:text-left">
          {/* Name + mission */}
          <div data-reveal>
            <h3 className="font-quattrocento font-bold text-almond text-lg tracking-wide">
              VABS
            </h3>
            <p className="mt-1 font-instrumentSerif italic text-almond/80 text-base">
              Vanderbilt Association of Bengali Students
            </p>
            <p className="mt-2 text-almond/75 text-base leading-relaxed font-quattrocento max-w-xs mx-auto md:mx-0">
              Celebrating Bengali culture, building community, and sharing
              traditions at Vanderbilt University.
            </p>
          </div>

          {/* Quick links — mirrors the navbar anchors */}
          <nav
            data-reveal
            aria-label="Footer"
            className="flex flex-col items-center gap-2.5"
          >
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="relative font-quattrocento text-almond/75 hover:text-gold-light transition-colors text-base tracking-wide after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:bg-gold-light/70 after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Instagram */}
          <div data-reveal className="flex justify-center md:justify-end">
            <a
              href="https://www.instagram.com/vandy.bengalis/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 text-gold-light hover:text-almond transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:bg-gold-light/70 after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              <Instagram className="w-5 h-5" />
              <span className="font-quattrocento text-base">
                @vandy.bengalis
              </span>
            </a>
          </div>
        </div>

        {/* Divider + bottom line */}
        <div data-reveal className="flex flex-col items-center gap-6">
          <AlponaDivider className="shrink-0" />
          <div className="w-full max-w-xs pt-6 border-t border-gold/10 flex flex-col items-center gap-1.5 text-center">
            <p className="text-almond/60 text-sm font-quattrocento">
              Made with <span className="text-spanish">&hearts;</span> by VABS
              &middot; &copy; {year}
            </p>
            <p className="text-almond/60 text-sm font-quattrocento">
              Designed &amp; built in Nashville, TN
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
