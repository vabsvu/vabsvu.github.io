import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarEvent } from "../../types/events";
import { EventCard } from "./EventCard";
import { formatDayHeading } from "./formatters";

interface DayDetailPanelProps {
  dateStr: string;
  events: CalendarEvent[];
  hasPrev: boolean;
  hasNext: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

/**
 * Partiful-style day detail panel below the month grid:
 * "Saturday June 6th" heading, chevrons that jump to the
 * previous/next day with events, and the day's event cards.
 */
export function DayDetailPanel({
  dateStr,
  events,
  hasPrev,
  hasNext,
  onPrevDay,
  onNextDay,
  onSelectEvent,
}: DayDetailPanelProps) {
  return (
    <div className="mt-6 pt-5 border-t border-gold/10">
      <div className="flex items-center justify-between mb-4">
        <AnimatePresence mode="wait">
          <motion.h4
            key={dateStr}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-lg md:text-xl font-quattrocento font-bold text-almond"
          >
            {formatDayHeading(dateStr)}
          </motion.h4>
        </AnimatePresence>

        <div className="flex items-center gap-1">
          {/* aria-disabled (not disabled) keeps the chevrons focusable, so
              focus isn't dropped to <body> when one becomes unavailable
              mid-navigation; the onClick guard makes Enter a no-op. */}
          <button
            type="button"
            onClick={() => {
              if (hasPrev) onPrevDay();
            }}
            aria-disabled={!hasPrev}
            aria-label="Previous day with events"
            className="p-1.5 rounded-lg text-almond/70 hover:text-almond hover:bg-gold/10 aria-disabled:opacity-30 aria-disabled:hover:bg-transparent aria-disabled:hover:text-almond/70 aria-disabled:cursor-default transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (hasNext) onNextDay();
            }}
            aria-disabled={!hasNext}
            aria-label="Next day with events"
            className="p-1.5 rounded-lg text-almond/70 hover:text-almond hover:bg-gold/10 aria-disabled:opacity-30 aria-disabled:hover:bg-transparent aria-disabled:hover:text-almond/70 aria-disabled:cursor-default transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={dateStr}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="space-y-3"
        >
          {events.length === 0 ? (
            <p className="text-almond/80 font-quattrocento text-sm py-2">
              Nothing scheduled this day.
            </p>
          ) : (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={onSelectEvent}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
