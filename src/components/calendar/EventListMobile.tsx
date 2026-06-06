import React, { useMemo } from "react";
import type { CalendarEvent } from "../../types/events";
import { EventCard } from "./EventCard";
import { formatDayHeading } from "./formatters";

interface EventListMobileProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

/**
 * Mobile view: the visible month's events grouped by day,
 * as vertical cards matching the desktop detail-panel design.
 */
export function EventListMobile({
  events,
  onSelectEvent,
}: EventListMobileProps) {
  const groups = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    const sorted = [...events].sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.startTime ?? "").localeCompare(b.startTime ?? ""),
    );
    for (const event of sorted) {
      const list = map.get(event.date);
      if (list) list.push(event);
      else map.set(event.date, [event]);
    }
    return [...map.entries()];
  }, [events]);

  if (groups.length === 0) return null;

  return (
    <div className="space-y-6">
      {groups.map(([date, dayEvents]) => (
        <div key={date}>
          <h4 className="text-sm font-quattrocento font-bold text-almond/60 mb-2">
            {formatDayHeading(date)}
          </h4>
          <div className="space-y-3">
            {dayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={onSelectEvent}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
