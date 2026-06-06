import React from "react";
import { ArrowUpRight } from "lucide-react";
import type { CalendarEvent } from "../../types/events";
import { formatDateChip } from "./formatters";

interface AroundMonthStripProps {
  /** Nearest events before the visible month, chronological */
  before: CalendarEvent[];
  /** Nearest events after the visible month, chronological */
  after: CalendarEvent[];
  /** Year of the visible month — chips only show a year when it differs */
  visibleYear: number;
  /** Navigate the calendar to the event's month and select its date */
  onGoToDate: (dateStr: string) => void;
}

function StripRow({
  event,
  isPast,
  visibleYear,
  onGoToDate,
}: {
  event: CalendarEvent;
  isPast: boolean;
  visibleYear: number;
  onGoToDate: (dateStr: string) => void;
}) {
  const chipClass = isPast
    ? "bg-almond/10 border-almond/20 text-almond/70"
    : "bg-gold/15 border-gold/30 text-gold-light";

  return (
    <li>
      <button
        type="button"
        onClick={() => onGoToDate(event.date)}
        className="group flex w-full items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gold/10 transition-colors"
      >
        <span
          className={`shrink-0 min-w-[3.5rem] text-center px-2 py-1 rounded-md border text-[11px] leading-none font-quattrocento font-bold ${chipClass}`}
        >
          {formatDateChip(event.date, visibleYear)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-quattrocento font-bold text-almond group-hover:text-gold-light transition-colors">
            {event.title}
          </span>
          {event.location && (
            <span className="block truncate text-xs font-quattrocento text-almond/70">
              {event.location}
            </span>
          )}
        </span>
        <ArrowUpRight
          className="w-3.5 h-3.5 shrink-0 text-almond/40 group-hover:text-gold-light transition-colors"
          aria-hidden="true"
        />
      </button>
    </li>
  );
}

/**
 * Compact "Recently & up next" strip shown under the empty-month state:
 * the nearest events on either side of the visible month, as small rows
 * that jump the calendar to that date. Keeps quiet summer months from
 * feeling dead without faking data.
 */
export function AroundMonthStrip({
  before,
  after,
  visibleYear,
  onGoToDate,
}: AroundMonthStripProps) {
  if (before.length === 0 && after.length === 0) return null;

  const title =
    before.length > 0 && after.length > 0
      ? "Recently & up next"
      : after.length > 0
        ? "Up next"
        : "Recently";

  return (
    <div className="mt-2 pb-4 px-2">
      <p className="text-[11px] uppercase tracking-[0.2em] text-almond/70 font-quattrocento text-center mb-3">
        {title}
      </p>
      <ul className="max-w-md mx-auto space-y-1">
        {before.map((event) => (
          <StripRow
            key={event.id}
            event={event}
            isPast
            visibleYear={visibleYear}
            onGoToDate={onGoToDate}
          />
        ))}
        {after.map((event) => (
          <StripRow
            key={event.id}
            event={event}
            isPast={false}
            visibleYear={visibleYear}
            onGoToDate={onGoToDate}
          />
        ))}
      </ul>
    </div>
  );
}
