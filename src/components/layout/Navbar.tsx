import React, { useState, useEffect } from "react";
import { Instagram } from "lucide-react";

const navLinks = [
  { label: "Events", href: "#events" },
  { label: "Instagram", href: "#feed" },
  { label: "Mock Shaadi", href: "#past-events" },
];

// Anchor targets live inside lazy-loaded sections that may not have mounted
// yet (especially on slow connections) — retry until the section appears,
// mirroring SiteLayout's initial-hash handling, instead of dropping the click.
export function scrollTo(href: string) {
  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const deadline = Date.now() + 5000;
  const tryScroll = () => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    } else if (Date.now() < deadline) {
      setTimeout(tryScroll, 200);
    }
  };
  tryScroll();
}

// Real anchors keep middle-click / copy-link / new-tab behavior; we only
// hijack plain left-clicks so the retrying smooth scroll can handle targets
// in lazy-loaded sections, while still pushing a shareable #hash.
export function handleAnchorClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
) {
  // Let the browser handle new-tab / modified clicks natively
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
    return;
  e.preventDefault();
  history.pushState(null, "", href); // shareable hash without an instant native jump
  scrollTo(href); // existing 5s retry covers lazy-loaded sections
}

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        setScrolled(currentY > 40);
        setHidden(currentY > lastY && currentY > 120);
        lastY = currentY;
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        hidden ? "-translate-y-full invisible" : "translate-y-0 visible"
      } ${
        scrolled
          ? "bg-tyrian/90 backdrop-blur-md border-gold/20 shadow-lg shadow-black/20"
          : "bg-tyrian/40 backdrop-blur-sm border-gold/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo + wordmark */}
        <button
          onClick={() => scrollTo("#hero")}
          className="flex items-center gap-3 group"
          aria-label="Back to top"
        >
          <span className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <img
              src="/images/orgs/vabs.webp"
              alt=""
              className="w-full h-full object-contain scale-150"
            />
          </span>
          <span className="font-quattrocento font-bold text-almond text-lg tracking-wide group-hover:text-gold-light transition-colors">
            VABS
          </span>
          <span
            aria-hidden="true"
            className="hidden sm:inline font-['Tiro_Bangla'] text-gold-light/70 text-sm leading-none -ml-1"
          >
            বাংলা
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="relative font-quattrocento text-almond/80 hover:text-gold-light transition-colors text-sm tracking-wide after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:bg-gold-light/70 after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/vandy.bengalis/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="VABS on Instagram"
          className="p-2 rounded-full text-almond hover:text-gold-light hover:bg-gold/10 transition-colors"
        >
          <Instagram className="w-5 h-5" />
        </a>
      </div>

      {/* Mobile link row — compact horizontal scroll, no overlay */}
      <div className="md:hidden border-t border-gold/10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center justify-center gap-7 px-4 py-2 min-w-max mx-auto">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="relative font-quattrocento text-almond/80 hover:text-gold-light transition-colors text-xs tracking-wider whitespace-nowrap after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:bg-gold-light/70 after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
