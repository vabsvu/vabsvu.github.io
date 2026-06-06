import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

// --- Helpers (pure, computed once) ---

const f = (n: number) => +n.toFixed(1);

const pts = (r: number, n: number, off = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((i * 360) / n + off) * (Math.PI / 180);
    return [f(r * Math.cos(a)), f(r * Math.sin(a))] as const;
  });

const scallopRing = (r: number, n: number, ar: number) => {
  const p = pts(r, n);
  let d = `M ${p[0][0]},${p[0][1]}`;
  for (let i = 1; i <= n; i++) d += ` A ${ar},${ar} 0 0,1 ${p[i % n][0]},${p[i % n][1]}`;
  return d;
};

const petal = (deg: number, r1: number, r2: number, w: number) => {
  const a = (deg * Math.PI) / 180;
  const p = a + Math.PI / 2;
  const mx = ((r1 + r2) / 2) * Math.cos(a);
  const my = ((r1 + r2) / 2) * Math.sin(a);
  return `M ${f(r1 * Math.cos(a))},${f(r1 * Math.sin(a))} Q ${f(mx + w * Math.cos(p))},${f(my + w * Math.sin(p))} ${f(r2 * Math.cos(a))},${f(r2 * Math.sin(a))} Q ${f(mx - w * Math.cos(p))},${f(my - w * Math.sin(p))} ${f(r1 * Math.cos(a))},${f(r1 * Math.sin(a))}`;
};

const flowerAt = (cx: number, cy: number, r: number) =>
  Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 * Math.PI) / 180;
    const b = ((i + 1) * 72 * Math.PI) / 180;
    const m = (a + b) / 2;
    return `M ${f(cx + r * 0.35 * Math.cos(a))},${f(cy + r * 0.35 * Math.sin(a))} Q ${f(cx + r * Math.cos(m))},${f(cy + r * Math.sin(m))} ${f(cx + r * 0.35 * Math.cos(b))},${f(cy + r * 0.35 * Math.sin(b))}`;
  });

const spiralAt = (cx: number, cy: number, r: number) =>
  `M ${cx},${cy} C ${f(cx + r * 0.3)},${f(cy - r * 0.15)} ${f(cx + r * 0.15)},${f(cy + r * 0.3)} ${f(cx - r * 0.1)},${f(cy + r * 0.1)} C ${f(cx - r * 0.25)},${f(cy - r * 0.08)} ${f(cx - r * 0.08)},${f(cy - r * 0.2)} ${f(cx + r * 0.12)},${f(cy - r * 0.1)}`;

// --- Pre-computed paths ---
const innerScallop = scallopRing(22, 10, 9);
const outerScallop = scallopRing(42, 14, 8);
const petals = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => petal(a, 24, 38, 6));
const dots1 = pts(16, 8);
const dots2 = pts(30, 8, 22.5);

const flowers = [
  { x: 95, y: -35, r: 12 },
  { x: -95, y: -35, r: 12 },
  { x: 95, y: 35, r: 10 },
  { x: -95, y: 35, r: 10 },
];

// --- Component ---

const HennaPatterns = ({ isVisible = true }: { isVisible?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useGSAP(
    () => {
      if (!isVisible || played.current) return;
      played.current = true;
      const el = ref.current;
      if (!el) return;

      // Stroke-dash setup for all stroked paths
      el.querySelectorAll(".hs").forEach((e) => {
        const g = e as SVGGeometryElement;
        if (g.getTotalLength) {
          const l = g.getTotalLength();
          gsap.set(e, { strokeDasharray: l, strokeDashoffset: l });
        }
      });

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // Center dot
      tl.to(".hr0", { opacity: 0.5, duration: 0.3 }, 0);
      // Inner rings + scallop + dots
      tl.to(".hr1", { strokeDashoffset: 0, duration: 1, stagger: 0.08 }, 0.1);
      tl.to(".hd1", { opacity: 0.4, duration: 0.2, stagger: 0.03 }, 0.4);
      // Petals + outer scallop + dots
      tl.to(".hr2", { strokeDashoffset: 0, duration: 0.8, stagger: 0.05 }, 0.5);
      tl.to(".hd2", { opacity: 0.35, duration: 0.2, stagger: 0.03 }, 0.8);
      // Diamond outline, then crosshatch fill fades in
      tl.to(".hr3", { strokeDashoffset: 0, duration: 1.2 }, 0.7);
      tl.to(".hf3", { opacity: 1, duration: 0.8 }, 1.3);
      // Leaf chains radiate outward
      tl.to(".hr3c", { strokeDashoffset: 0, duration: 1, stagger: 0.06 }, 1.0);
      // Vines + leaves
      tl.to(".hr4", { strokeDashoffset: 0, duration: 1, stagger: 0.05 }, 1.2);
      // Flowers + accent dots
      tl.to(".hr5", { strokeDashoffset: 0, duration: 0.6, stagger: 0.03 }, 1.5);
      tl.to(".hd5", { opacity: 0.35, duration: 0.2, stagger: 0.03 }, 1.7);
    },
    { scope: ref, dependencies: [isVisible] },
  );

  const c = "#8B0000";

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none mix-blend-soft-light"
    >
      <svg viewBox="-150 -90 300 180" className="w-full h-full">
        <defs>
          <pattern
            id="henna-jaal"
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
          >
            <path
              d="M 0,0 L 8,8 M 8,0 L 0,8"
              stroke={c}
              strokeWidth="0.4"
              strokeOpacity="0.25"
            />
          </pattern>
        </defs>

        {/* --- Center dot --- */}
        <circle className="hr0" cx="0" cy="0" r="3" fill={c} opacity="0" />

        {/* --- Ring 1: inner circle + scalloped ring --- */}
        <circle className="hs hr1" cx="0" cy="0" r="10" stroke={c} strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
        <path className="hs hr1" d={innerScallop} stroke={c} strokeWidth="0.7" strokeOpacity="0.35" fill="none" />
        {dots1.map(([cx, cy], i) => (
          <circle key={`d1${i}`} className="hd1" cx={cx} cy={cy} r="1.3" fill={c} opacity="0" />
        ))}

        {/* --- Ring 2: petals + outer scallop --- */}
        {petals.map((d, i) => (
          <path key={`p${i}`} className="hs hr2" d={d} stroke={c} strokeWidth="0.6" strokeOpacity="0.35" fill="none" />
        ))}
        <path className="hs hr2" d={outerScallop} stroke={c} strokeWidth="0.6" strokeOpacity="0.3" fill="none" />
        {dots2.map(([cx, cy], i) => (
          <circle key={`d2${i}`} className="hd2" cx={cx} cy={cy} r="1" fill={c} opacity="0" />
        ))}

        {/* --- Diamond lattice (jaal) --- */}
        <path className="hs hr3" d="M 55,0 L 0,38 L -55,0 L 0,-38 Z" stroke={c} strokeWidth="0.8" strokeOpacity="0.35" fill="none" />
        <path className="hf3" d="M 55,0 L 0,38 L -55,0 L 0,-38 Z" fill="url(#henna-jaal)" opacity="0" />

        {/* --- Leaf chains radiating from diamond edges --- */}
        {/* Right */}
        <path className="hs hr3c" d="M 58,0 L 65,-5 L 72,0 L 79,5 L 86,0 L 93,-5 L 100,0 L 107,5 L 114,0" stroke={c} strokeWidth="0.6" strokeOpacity="0.28" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Left */}
        <path className="hs hr3c" d="M -58,0 L -65,-5 L -72,0 L -79,5 L -86,0 L -93,-5 L -100,0 L -107,5 L -114,0" stroke={c} strokeWidth="0.6" strokeOpacity="0.28" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Up */}
        <path className="hs hr3c" d="M 0,-42 L -4,-50 L 0,-58 L 4,-66 L 0,-74 L -4,-82 L 0,-88" stroke={c} strokeWidth="0.6" strokeOpacity="0.28" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Down */}
        <path className="hs hr3c" d="M 0,42 L 4,50 L 0,58 L -4,66 L 0,74 L 4,82 L 0,88" stroke={c} strokeWidth="0.6" strokeOpacity="0.28" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* --- Vine curves toward corners with leaves --- */}
        {/* Upper-right */}
        <path className="hs hr4" d="M 40,-26 C 58,-40 78,-22 98,-34 C 112,-42 126,-28 140,-34" stroke={c} strokeWidth="0.7" strokeOpacity="0.3" strokeLinecap="round" fill="none" />
        <path className="hs hr4" d="M 62,-34 C 67,-40 70,-35 66,-31" stroke={c} strokeWidth="0.4" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
        <path className="hs hr4" d="M 85,-26 C 90,-32 93,-27 89,-23" stroke={c} strokeWidth="0.4" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
        <path className="hs hr4" d="M 115,-36 C 120,-42 123,-37 119,-33" stroke={c} strokeWidth="0.4" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
        {/* Upper-left */}
        <path className="hs hr4" d="M -40,-26 C -58,-40 -78,-22 -98,-34 C -112,-42 -126,-28 -140,-34" stroke={c} strokeWidth="0.7" strokeOpacity="0.3" strokeLinecap="round" fill="none" />
        <path className="hs hr4" d="M -62,-34 C -67,-40 -70,-35 -66,-31" stroke={c} strokeWidth="0.4" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
        <path className="hs hr4" d="M -85,-26 C -90,-32 -93,-27 -89,-23" stroke={c} strokeWidth="0.4" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
        <path className="hs hr4" d="M -115,-36 C -120,-42 -123,-37 -119,-33" stroke={c} strokeWidth="0.4" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
        {/* Lower-right */}
        <path className="hs hr4" d="M 40,26 C 58,40 78,22 98,34 C 112,42 126,28 140,34" stroke={c} strokeWidth="0.7" strokeOpacity="0.3" strokeLinecap="round" fill="none" />
        <path className="hs hr4" d="M 62,34 C 67,40 70,35 66,31" stroke={c} strokeWidth="0.4" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
        <path className="hs hr4" d="M 85,26 C 90,32 93,27 89,23" stroke={c} strokeWidth="0.4" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
        {/* Lower-left */}
        <path className="hs hr4" d="M -40,26 C -58,40 -78,22 -98,34 C -112,42 -126,28 -140,34" stroke={c} strokeWidth="0.7" strokeOpacity="0.3" strokeLinecap="round" fill="none" />
        <path className="hs hr4" d="M -62,34 C -67,40 -70,35 -66,31" stroke={c} strokeWidth="0.4" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
        <path className="hs hr4" d="M -85,26 C -90,32 -93,27 -89,23" stroke={c} strokeWidth="0.4" strokeOpacity="0.22" strokeLinecap="round" fill="none" />

        {/* --- Flower motifs near corners --- */}
        {flowers.map(({ x, y, r }, fi) => (
          <React.Fragment key={`fl${fi}`}>
            {flowerAt(x, y, r).map((d, pi) => (
              <path key={`fl${fi}p${pi}`} className="hs hr5" d={d} stroke={c} strokeWidth="0.5" strokeOpacity="0.28" strokeLinecap="round" fill="none" />
            ))}
            <path className="hs hr5" d={spiralAt(x, y, r)} stroke={c} strokeWidth="0.4" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
            <circle className="hd5" cx={x} cy={y} r="1.2" fill={c} opacity="0" />
          </React.Fragment>
        ))}

        {/* Accent dots along vines */}
        {[70, 100, 128, -70, -100, -128].map((x) => (
          <React.Fragment key={`vd${x}`}>
            <circle className="hd5" cx={x} cy={x > 0 ? -30 : -30} r="0.8" fill={c} opacity="0" />
            <circle className="hd5" cx={x} cy={x > 0 ? 30 : 30} r="0.8" fill={c} opacity="0" />
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
};

export default HennaPatterns;
