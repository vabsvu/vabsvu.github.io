import React from "react";
import { CalendarDays, Instagram, ArrowRight } from "lucide-react";

interface EmptyMonthStateProps {
  hasUpcoming: boolean;
  onJumpToNext: () => void;
}

export function EmptyMonthState({
  hasUpcoming,
  onJumpToNext,
}: EmptyMonthStateProps) {
  return (
    <div className="flex flex-col items-center text-center pt-10 pb-6 px-4">
      <CalendarDays
        className="w-10 h-10 text-gold/40 mb-3"
        aria-hidden="true"
      />
      <p className="text-almond/75 font-quattrocento text-xl">
        No events this month — yet
      </p>
      <a
        href="https://www.instagram.com/vandy.bengalis/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center justify-center gap-1.5 text-gold-light hover:text-spanish text-base font-quattrocento transition-colors"
      >
        <Instagram className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Follow @vandy.bengalis for announcements</span>
      </a>
      {hasUpcoming && (
        <button
          type="button"
          onClick={onJumpToNext}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-quattrocento font-bold text-gold-light border border-gold/30 bg-gold/10 hover:bg-gold/20 transition-colors"
        >
          Jump to next event
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
