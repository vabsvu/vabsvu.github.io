import React, { useRef, useEffect, ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

interface AnimatedBorderProps {
  children: ReactNode;
  className?: string;
}

// --- Path data (computed once at module level) ---

interface PathDef {
  d: string;
  sw: number;
  cls: string;
}

const borderPaths: PathDef[] = (() => {
  const p: PathDef[] = [];
  const f = (n: number) => +n.toFixed(1);

  // Center petals (8 curves radiating from center)
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 * Math.PI) / 180;
    const o = a + Math.PI / 3;
    p.push({
      d: `M ${f(50 + 2 * Math.cos(a))},${f(50 + 2 * Math.sin(a))} Q ${f(50 + 5.5 * Math.cos(a) + 1.5 * Math.cos(o))},${f(50 + 5.5 * Math.sin(a) + 1.5 * Math.sin(o))} ${f(50 + 9 * Math.cos(a))},${f(50 + 9 * Math.sin(a))}`,
      sw: 0.2,
      cls: "bp-c",
    });
  }

  // Main vines (center to corners)
  for (const d of [
    "M 46,44 C 38,36 26,40 16,28 C 10,20 6,12 3,5",
    "M 54,44 C 62,36 74,40 84,28 C 90,20 94,12 97,5",
    "M 46,56 C 38,64 26,60 16,72 C 10,80 6,88 3,95",
    "M 54,56 C 62,64 74,60 84,72 C 90,80 94,88 97,95",
  ]) p.push({ d, sw: 0.24, cls: "bp-v" });

  // Secondary vines
  for (const d of [
    "M 44,46 C 34,40 22,46 12,36 C 6,30 4,20 2,10",
    "M 56,46 C 66,40 78,46 88,36 C 94,30 96,20 98,10",
    "M 44,54 C 34,60 22,54 12,64 C 6,70 4,80 2,90",
    "M 56,54 C 66,60 78,54 88,64 C 94,70 96,80 98,90",
  ]) p.push({ d, sw: 0.16, cls: "bp-v2" });

  // Leaf accents
  for (const d of [
    "M 30,36 c -3,-2 -4,0 -2,3",
    "M 20,30 c -2,-3 -4,-1 -2,2",
    "M 10,18 c -2,-2 -3,1 -1,3",
    "M 70,36 c 3,-2 4,0 2,3",
    "M 80,30 c 2,-3 4,-1 2,2",
    "M 90,18 c 2,-2 3,1 1,3",
    "M 30,64 c -3,2 -4,0 -2,-3",
    "M 20,70 c -2,3 -4,1 -2,-2",
    "M 10,82 c -2,2 -3,-1 -1,-3",
    "M 70,64 c 3,2 4,0 2,-3",
    "M 80,70 c 2,3 4,1 2,-2",
    "M 90,82 c 2,2 3,-1 1,-3",
  ]) p.push({ d, sw: 0.12, cls: "bp-l" });

  // Edge curves
  for (const d of [
    "M 6,3 C 18,7 28,1 40,4 C 50,6 60,2 72,5 C 82,7 92,3 97,4",
    "M 3,97 C 15,93 25,99 38,96 C 50,94 62,98 74,95 C 84,93 94,97 97,96",
    "M 3,6 C 6,18 1,30 4,42 C 6,52 2,62 4,74 C 6,84 3,92 3,97",
    "M 97,3 C 94,15 99,28 96,40 C 94,50 98,62 96,74 C 94,84 97,92 97,97",
  ]) p.push({ d, sw: 0.14, cls: "bp-e" });

  // Corner curls
  for (const d of [
    "M 3,3 c 3,2 5,6 3,9 c -3,2 -5,-2 -3,-5",
    "M 97,3 c -3,2 -5,6 -3,9 c 3,2 5,-2 3,-5",
    "M 3,97 c 3,-2 5,-6 3,-9 c -3,-2 -5,2 -3,5",
    "M 97,97 c -3,-2 -5,-6 -3,-9 c 3,-2 5,2 3,5",
    "M 5,5 c 5,3 8,8 5,13 c -4,3 -7,-1 -5,-5",
    "M 95,5 c -5,3 -8,8 -5,13 c 4,3 7,-1 5,-5",
    "M 5,95 c 5,-3 8,-8 5,-13 c -4,-3 -7,1 -5,5",
    "M 95,95 c -5,-3 -8,-8 -5,-13 c 4,-3 7,1 5,5",
  ]) p.push({ d, sw: 0.18, cls: "bp-cr" });

  // Dot accents
  for (const [x, y] of [
    [50, 42], [50, 58], [42, 50], [58, 50],
    [35, 35], [65, 35], [35, 65], [65, 65],
    [20, 20], [80, 20], [20, 80], [80, 80],
  ] as [number, number][])
    p.push({
      d: `M ${x - 0.7},${y} a 0.7,0.7 0 1,0 1.4,0 a 0.7,0.7 0 1,0 -1.4,0`,
      sw: 0.1,
      cls: "bp-d",
    });

  return p;
})();

// --- Component ---

const AnimatedBorder: React.FC<AnimatedBorderProps> = ({
  children,
  className = "",
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // GSAP draw animation — 7 grouped tweens instead of 50+ individual FM animations
  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;

      // Set up stroke-dash on all paths at once
      svg.querySelectorAll("path[class]").forEach((el) => {
        const path = el as SVGPathElement;
        const len = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: len,
          strokeDashoffset: len,
          opacity: 0,
        });
      });

      const defaults = { ease: "power2.inOut" };
      const tl = gsap.timeline({ defaults });

      // Final opacities vary per class so the drawing has depth: primary
      // strokes (center, vines, corners) settle at 1, secondary detail
      // (leaves, fine vines, dots) sits slightly back.
      tl.to(".bp-c", { strokeDashoffset: 0, opacity: 1, stagger: 0.04, duration: 0.8 }, 0);
      tl.to(".bp-v", { strokeDashoffset: 0, opacity: 1, stagger: 0.08, duration: 1.6 }, 0.3);
      tl.to(".bp-v2", { strokeDashoffset: 0, opacity: 0.85, stagger: 0.06, duration: 1.4 }, 0.5);
      tl.to(".bp-d", { strokeDashoffset: 0, opacity: 0.9, stagger: 0.03, duration: 0.3 }, 0.4);
      tl.to(".bp-l", { strokeDashoffset: 0, opacity: 0.8, stagger: 0.04, duration: 0.4 }, 0.8);
      tl.to(".bp-e", { strokeDashoffset: 0, opacity: 0.9, stagger: 0.06, duration: 1.0 }, 1.2);
      tl.to(".bp-cr", { strokeDashoffset: 0, opacity: 1, stagger: 0.05, duration: 0.7 }, 1.5);
    },
    { scope: overlayRef },
  );

  // Scroll-linked opacity on the container (vanilla JS, RAF-throttled)
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    let raf: number;

    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const t = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
      el.style.opacity = String(0.3 * (1 - t * 0.7));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* SVG border — behind content */}
      <div
        ref={overlayRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.3 }}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          {borderPaths.map((p, i) => (
            <path
              key={i}
              className={p.cls}
              d={p.d}
              stroke="url(#borderGradient)"
              strokeWidth={p.sw}
              strokeLinecap="round"
              fill="none"
            />
          ))}
          <defs>
            <linearGradient
              id="borderGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#bf9b30" />
              <stop offset="25%" stopColor="#e36414" />
              <stop offset="50%" stopColor="#bf9b30" />
              <stop offset="75%" stopColor="#e36414" />
              <stop offset="100%" stopColor="#bf9b30" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content — above the border */}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
};

export default AnimatedBorder;
