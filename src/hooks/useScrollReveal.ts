import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function useScrollReveal(options?: {
  y?: number;
  duration?: number;
  stagger?: number;
  start?: string;
}) {
  const { y = 30, duration = 0.8, stagger = 0.15, start = "top 85%" } =
    options ?? {};
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const children = el.querySelectorAll("[data-reveal]");
      const targets = children.length > 0 ? Array.from(children) : [el];

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // No reveal animation — resolve straight to the final, visible
        // state and clear anything a previous run may have left inline.
        gsap.set(targets, { clearProps: "opacity,transform" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.from(targets, {
          y,
          opacity: 0,
          duration,
          stagger,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
          },
        });

        // Safety net: if the section is already above the viewport on
        // mount (deep link, reload mid-page, late lazy mount), never
        // leave it hidden — jump straight to the revealed state.
        if (el.getBoundingClientRect().bottom < 0) {
          tween.progress(1);
        }
      });
    },
    { scope: ref },
  );

  return ref;
}
