import React from "react";

export interface AlponaDividerProps {
  className?: string;
}

/**
 * Hand-drawn alpona/kantha-inspired divider — a central lotus bud flanked by
 * two symmetric paisley curls, connecting vines, gently waving rules, and
 * four accent dots. Pure inline SVG line art (1px gold stroke), decorative
 * only. No motion libraries, no hooks (safe in eager chunks).
 */
export function AlponaDivider({ className = "" }: AlponaDividerProps) {
  return (
    <svg
      viewBox="0 0 180 24"
      width="180"
      height="24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="#bf9b30"
        strokeOpacity="0.5"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Outer rules — gently waved so they read as drawn, not ruled */}
        <path d="M3 12 C 13 11.3, 26 12.7, 37.5 12" />
        <path d="M177 12 C 167 11.3, 154 12.7, 142.5 12" />

        {/* Left paisley — bulb with inner spiral, tail sweeping toward center */}
        <path d="M71 14.5 C 64 17.6, 56 18.4, 50.5 15 C 45.6 12, 46.4 5.6, 53.5 4.6 C 58.6 4.6, 60.8 8.6, 57.6 11.2 C 55.4 13.2, 52.8 12.2, 53.2 9.6" />
        {/* Right paisley (mirror) */}
        <path d="M109 14.5 C 116 17.6, 124 18.4, 129.5 15 C 134.4 12, 133.6 5.6, 126.5 4.6 C 121.4 4.6, 119.2 8.6, 122.4 11.2 C 124.6 13.2, 127.2 12.2, 126.8 9.6" />

        {/* Vines joining the paisley tails to the lotus base */}
        <path d="M71 14.5 C 74.5 16.4, 77.6 18.2, 81 19" />
        <path d="M109 14.5 C 105.5 16.4, 102.4 18.2, 99 19" />

        {/* Lotus base cradle */}
        <path d="M81 19 Q 90 23.2, 99 19" />

        {/* Central lotus bud with two petal veins */}
        <path d="M90 18.6 C 85.8 15.2, 85.4 8.8, 90 3.4 C 94.6 8.8, 94.2 15.2, 90 18.6 Z" />
        <path d="M90 18.6 C 88.2 14.6, 88.1 9.6, 89.5 6.4" />
        <path d="M90 18.6 C 91.8 14.6, 91.9 9.6, 90.5 6.4" />

        {/* Outer petals splaying from the base, tipped with a small curl */}
        <path d="M88.4 18.8 C 82.4 17.4, 78.6 12.8, 79.6 7.4 C 79.9 5.9, 81.5 5.5, 82.3 6.9" />
        <path d="M91.6 18.8 C 97.6 17.4, 101.4 12.8, 100.4 7.4 C 100.1 5.9, 98.5 5.5, 97.7 6.9" />
      </g>

      {/* Accent dots */}
      <g fill="#bf9b30" fillOpacity="0.5">
        <circle cx="42" cy="12" r="0.9" />
        <circle cx="138" cy="12" r="0.9" />
        <circle cx="74.8" cy="8.2" r="0.8" />
        <circle cx="105.2" cy="8.2" r="0.8" />
      </g>
    </svg>
  );
}

export default AlponaDivider;
