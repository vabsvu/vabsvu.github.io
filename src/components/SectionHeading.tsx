import React from "react";

export interface SectionHeadingProps {
  /** Section number as Bengali numerals, e.g. "০১" (rendered in Tiro Bangla) */
  index: string;
  /** Short uppercase eyebrow label, e.g. "What's coming" */
  label: string;
  /** Main heading content */
  title: React.ReactNode;
  /** Optional italic display accent line under the title */
  accent?: string;
  align?: "left" | "center";
}

/**
 * Editorial section heading — eyebrow rule + Bengali index + tracked label,
 * a large Quattrocento title, and an optional Instrument Serif accent line.
 * Pure CSS/JSX: no motion libraries, no hooks (safe in eager chunks).
 */
export function SectionHeading({
  index,
  label,
  title,
  accent,
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={
        centered ? "flex flex-col items-center text-center" : "text-left"
      }
    >
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-px w-12 bg-gold/40" />
        <span lang="bn" className="font-tiroBangla text-sm text-gold-light/90">
          {index}
        </span>
        <span className="font-quattrocento text-xs uppercase tracking-[0.3em] text-gold-light/80">
          {label}
        </span>
        {centered && (
          <span aria-hidden="true" className="h-px w-12 bg-gold/40" />
        )}
      </div>

      <h2 className="mt-4 font-quattrocento text-4xl font-bold tracking-tight text-almond md:text-5xl">
        {title}
      </h2>

      {accent && (
        <p className="mt-2 font-instrumentSerif text-lg italic text-[#f0a36e] md:text-xl">
          {accent}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
