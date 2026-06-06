import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  monthName: string;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  monthName,
  year,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl md:text-3xl font-quattrocento font-bold text-almond">
        {monthName} {year}
      </h3>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToday}
          aria-label="Go to today"
          className="px-3.5 py-1.5 text-xs font-quattrocento font-bold rounded-full text-gold-light border border-gold/30 bg-gold/10 hover:bg-gold/20 transition-colors"
        >
          Today
        </button>
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous month"
          className="p-1.5 rounded-lg hover:bg-gold/10 text-almond/70 hover:text-almond transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next month"
          className="p-1.5 rounded-lg hover:bg-gold/10 text-almond/70 hover:text-almond transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
