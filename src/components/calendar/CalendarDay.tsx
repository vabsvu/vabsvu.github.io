import React from "react";
import type { CalendarEvent, EventCategory } from "../../types/events";

const categoryDots: Record<EventCategory, string> = {
  flagship: "bg-spanish",
  social: "bg-gold",
  cultural: "bg-carmine",
  meeting: "bg-almond/60",
  food: "bg-gold",
  other: "bg-almond/40",
};

const categoryGradients: Record<EventCategory, string> = {
  flagship: "from-spanish/70 to-carmine/60",
  social: "from-gold/60 to-spanish/50",
  cultural: "from-carmine/70 to-tyrian/80",
  meeting: "from-tyrian/80 to-carmine/50",
  food: "from-gold/60 to-carmine/50",
  other: "from-tyrian/70 to-carmine/40",
};

// Deterministic "random-feeling" tilt derived from the day number.
// Whole-degree rotations only — fractional angles rasterize blurry at
// thumbnail sizes.
const ROTATIONS = [
  "-rotate-3",
  "rotate-2",
  "-rotate-2",
  "rotate-3",
  "-rotate-1",
  "rotate-1",
];

/**
 * Prefer the pre-sized ~192px thumbnail over the full-resolution image —
 * downscaling a 1080px JPG into a ~40px box is what made thumbs look muddy.
 */
const thumbSrc = (event: CalendarEvent) => event.thumbUrl ?? event.imageUrl;

interface CalendarDayProps {
  day: number;
  monthName: string;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
  onSelectDay: (day: number) => void;
}

export function CalendarDay({
  day,
  monthName,
  isToday,
  isSelected,
  events,
  onSelectDay,
}: CalendarDayProps) {
  const hasEvents = events.length > 0;
  const firstWithImage = events.find((e) => thumbSrc(e)) ?? null;
  const backEvent =
    events.length > 1
      ? (events.find((e) => e !== firstWithImage) ?? null)
      : null;

  const rotation = ROTATIONS[day % ROTATIONS.length];
  const backRotation = ROTATIONS[(day + 3) % ROTATIONS.length];

  const label = hasEvents
    ? `${monthName} ${day}, ${events.length} event${events.length === 1 ? "" : "s"}`
    : `${monthName} ${day}, no events`;

  const ringClass = isToday
    ? "ring-2 ring-gold"
    : isSelected
      ? "ring-1 ring-gold/50"
      : "";
  const bgClass = isSelected ? "bg-gold/10" : isToday ? "bg-gold/5" : "";

  return (
    <button
      type="button"
      disabled={!hasEvents}
      onClick={() => onSelectDay(day)}
      aria-label={label}
      aria-pressed={hasEvents ? isSelected : undefined}
      aria-current={isToday ? "date" : undefined}
      className={`group relative flex flex-col items-center justify-start p-1.5 md:p-2 rounded-lg min-h-[68px] md:min-h-[88px] transition-colors duration-150 ${
        hasEvents ? "cursor-pointer hover:bg-gold/10" : "cursor-default"
      } ${ringClass} ${bgClass}`}
    >
      {firstWithImage ? (
        <>
          {/* Day number tucked in the corner */}
          <span
            className={`self-start text-[10px] leading-none font-quattrocento ${
              isToday ? "text-gold-light font-bold" : "text-almond/80"
            }`}
          >
            {day}
          </span>

          {/* Photo thumbnail(s), Partiful-style. Rotation lives on a
              transform-gpu wrapper (exact 40px / 48px boxes) so the tilt
              rasterizes on a GPU layer instead of smearing subpixels. */}
          <div className="relative mt-1 md:mt-1.5">
            {backEvent &&
              (thumbSrc(backEvent) ? (
                <div
                  className={`absolute top-0.5 left-1.5 w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden ring-1 ring-almond/15 opacity-80 transform-gpu ${backRotation}`}
                >
                  <img
                    src={thumbSrc(backEvent) as string}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ) : (
                <div
                  className={`absolute top-0.5 left-1.5 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${categoryGradients[backEvent.category]} ring-1 ring-almond/15 opacity-80 transform-gpu ${backRotation}`}
                />
              ))}
            <div
              className={`relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden ring-1 ring-almond/25 shadow-md shadow-black/30 transform-gpu transition-transform duration-150 group-hover:scale-105 ${rotation}`}
            >
              <img
                src={thumbSrc(firstWithImage) as string}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <span
            className={`text-sm font-quattrocento ${
              isToday ? "text-gold-light font-bold" : "text-almond/70"
            }`}
          >
            {day}
          </span>

          {hasEvents && (
            <div className="flex gap-1 mt-1.5 flex-wrap justify-center">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className={`w-1.5 h-1.5 rounded-full ${categoryDots[event.category]}`}
                />
              ))}
            </div>
          )}

          {hasEvents && (
            <p className="hidden md:block text-[10px] text-almond/80 mt-1 leading-tight text-center line-clamp-2">
              {events[0].title}
            </p>
          )}
        </>
      )}
    </button>
  );
}
