import React from "react";
import { MapPin, Instagram, CalendarDays } from "lucide-react";
import type { CalendarEvent, EventCategory } from "../../types/events";
import { relativeDateLabel } from "./formatters";

const pillStyles: Record<EventCategory, string> = {
  flagship: "bg-spanish/20 text-spanish",
  social: "bg-gold/20 text-gold-light",
  cultural: "bg-carmine/30 text-almond",
  meeting: "bg-almond/10 text-almond/80",
  food: "bg-gold/20 text-gold-light",
  other: "bg-almond/10 text-almond/70",
};

const fallbackGradients: Record<EventCategory, string> = {
  flagship: "from-spanish/70 to-carmine/60",
  social: "from-gold/60 to-spanish/50",
  cultural: "from-carmine/70 to-tyrian/80",
  meeting: "from-tyrian/80 to-carmine/50",
  food: "from-gold/60 to-carmine/50",
  other: "from-tyrian/70 to-carmine/40",
};

interface EventCardProps {
  event: CalendarEvent;
  onSelect: (event: CalendarEvent) => void;
}

/**
 * Partiful-style event card: thumbnail left, relative-date pill,
 * bold title, location/host line. The whole card opens the event
 * modal via a stretched button; the Instagram link sits above it.
 */
export function EventCard({ event, onSelect }: EventCardProps) {
  // Prefer the pre-sized ~192px thumbnail; the full image is overkill at 64px
  const thumb = event.thumbUrl ?? event.imageUrl;

  return (
    <div className="group relative flex items-center gap-3 p-3 rounded-xl bg-black/15 border border-gold/10 hover:border-gold/30 hover:bg-black/25 transition-colors">
      {/* Stretched click target for the modal */}
      <button
        type="button"
        onClick={() => onSelect(event)}
        aria-label={`View details for ${event.title}`}
        className="absolute inset-0 z-0 rounded-xl"
      />

      {/* Thumbnail (or category-colored fallback) */}
      {thumb ? (
        <img
          src={thumb}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-16 h-16 rounded-xl object-cover object-center ring-1 ring-almond/15 flex-shrink-0 pointer-events-none"
        />
      ) : (
        <div
          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${fallbackGradients[event.category]} ring-1 ring-almond/10 flex items-center justify-center flex-shrink-0 pointer-events-none`}
        >
          <CalendarDays className="w-6 h-6 text-almond/60" aria-hidden="true" />
        </div>
      )}

      <div className="min-w-0 flex-1 pointer-events-none">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-sm font-quattrocento font-bold ${pillStyles[event.category]}`}
        >
          {relativeDateLabel(event.date, event.startTime)}
        </span>

        <p className="mt-1 text-almond font-quattrocento font-bold text-base md:text-lg leading-snug truncate">
          {event.title}
        </p>

        {(event.location || event.host) && (
          <p className="mt-0.5 flex items-center gap-1.5 text-almond/60 text-sm font-quattrocento">
            {event.location && (
              <>
                <MapPin
                  className="w-3.5 h-3.5 text-gold flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="truncate">{event.location}</span>
              </>
            )}
            {event.host && (
              <span className="truncate">
                {event.location ? "· " : ""}Hosted by {event.host}
              </span>
            )}
          </p>
        )}

        {event.instagramPermalink && (
          <a
            href={event.instagramPermalink}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 pointer-events-auto mt-1 inline-flex items-center gap-1 text-gold-light hover:text-spanish text-sm font-quattrocento transition-colors"
          >
            <Instagram className="w-3.5 h-3.5" aria-hidden="true" />
            View on Instagram
          </a>
        )}
      </div>
    </div>
  );
}
