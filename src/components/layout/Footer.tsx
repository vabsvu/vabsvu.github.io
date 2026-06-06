import React from "react";
import { Instagram } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { handleAnchorClick } from "./Navbar";

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
      <div
        ref={footerRef}
        className="max-w-5xl mx-auto flex flex-col items-center gap-6 text-center"
      >
        {/* Name + mission */}
        <div data-reveal>
          <h3 className="font-quattrocento font-bold text-almond text-lg tracking-wide">
            Vanderbilt Association of Bengali Students
          </h3>
          <p className="mt-2 text-almond/70 text-sm font-quattrocento max-w-md mx-auto">
            Celebrating Bengali culture, building community, and sharing
            traditions at Vanderbilt University.
          </p>
        </div>

        {/* Quick links — mirrors the navbar anchors */}
        <nav
          data-reveal
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2"
        >
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="font-quattrocento text-almond/70 hover:text-gold transition-colors text-sm tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Instagram */}
        <a
          data-reveal
          href="https://www.instagram.com/vandy.bengalis/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gold hover:text-spanish transition-colors"
        >
          <Instagram className="w-5 h-5" />
          <span className="font-quattrocento text-sm">@vandy.bengalis</span>
        </a>

        {/* Bottom line */}
        <div
          data-reveal
          className="w-full max-w-xs pt-6 border-t border-gold/10 flex flex-col items-center gap-1.5"
        >
          <p className="text-almond/60 text-xs font-quattrocento">
            Made with <span className="text-spanish">&hearts;</span> by VABS
            &middot; &copy; {year}
          </p>
          <p className="text-almond/60 text-xs font-quattrocento">
            Designed &amp; built in Nashville, TN
          </p>
        </div>
      </div>
    </footer>
  );
}
