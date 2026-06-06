import React from "react";
import { CalendarDay } from "./CalendarDay";
import type { CalendarEvent } from "../../types/events";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarGridProps {
  daysInMonth: number;
  firstDayOfWeek: number;
  monthName: string;
  selectedDay: number | null;
  getEventsForDay: (day: number) => CalendarEvent[];
  isToday: (day: number) => boolean;
  onSelectDay: (day: number) => void;
}

export function CalendarGrid({
  daysInMonth,
  firstDayOfWeek,
  monthName,
  selectedDay,
  getEventsForDay,
  isToday,
  onSelectDay,
}: CalendarGridProps) {
  return (
    <div>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-quattrocento text-almond/70 py-2"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          return (
            <CalendarDay
              key={day}
              day={day}
              monthName={monthName}
              isToday={isToday(day)}
              isSelected={selectedDay === day}
              events={getEventsForDay(day)}
              onSelectDay={onSelectDay}
            />
          );
        })}
      </div>
    </div>
  );
}
