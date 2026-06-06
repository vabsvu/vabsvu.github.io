import React, { useState, useEffect } from "react";
import { MotionConfig, motion } from "framer-motion";
import { useCalendar } from "../../hooks/useCalendar";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { DayDetailPanel } from "./DayDetailPanel";
import { EmptyMonthState } from "./EmptyMonthState";
import { AroundMonthStrip } from "./AroundMonthStrip";
import { EventListMobile } from "./EventListMobile";
import { EventModal } from "./EventModal";
import type { CalendarEvent, EventsData } from "../../types/events";

export default function EventsCalendar() {
  const sectionRef = useScrollReveal();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  // Read the media query synchronously so phones never paint the desktop
  // 7-col grid for a frame before useEffect corrects it (client-only app,
  // window is always defined at render).
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    fetch("/data/events.json")
      .then((r) => r.json())
      .then((data: EventsData) => setEvents(data.events))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const calendar = useCalendar(events);
  const hasMonthEvents = calendar.monthEvents.length > 0;
  // Key for the subtle fade-in when the visible month changes
  const monthKey = `${calendar.currentYear}-${calendar.currentMonth}`;

  const jumpToNextEvent = () => {
    if (calendar.nextUpcomingDate) calendar.goToDate(calendar.nextUpcomingDate);
  };

  const aroundStrip = (
    <AroundMonthStrip
      before={calendar.aroundMonthEvents.before}
      after={calendar.aroundMonthEvents.after}
      visibleYear={calendar.currentYear}
      onGoToDate={calendar.goToDate}
    />
  );

  return (
    // reducedMotion="user": framer transforms (panel slide, modal spring)
    // respect the OS prefers-reduced-motion setting; opacity fades still run.
    // Lives here (lazy chunk) instead of App so framer-motion stays out of
    // the eager entry bundle.
    <MotionConfig reducedMotion="user">
      <section id="events" className="py-16 px-4">
        <div ref={sectionRef} className="max-w-4xl mx-auto">
          {/* Section header */}
          <div data-reveal className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-quattrocento font-bold text-almond">
              Events
            </h2>
            <p className="text-almond/70 font-quattrocento mt-2 text-sm">
              Stay up to date with VABS activities
            </p>
          </div>

          {/* Calendar card */}
          <div
            data-reveal
            className="rounded-2xl bg-gradient-to-br from-[#460b2f]/80 to-[#9a031e]/40 border border-gold/10 backdrop-blur-sm p-4 md:p-6"
          >
            <CalendarHeader
              monthName={calendar.monthName}
              year={calendar.currentYear}
              onPrev={calendar.goPrevMonth}
              onNext={calendar.goNextMonth}
              onToday={calendar.goToday}
            />

            {isDesktop ? (
              <>
                {/* Keyed on month: quick fade-in so switching months
                    doesn't hard-pop. No exit phase — stays snappy. */}
                <motion.div
                  key={monthKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <CalendarGrid
                    daysInMonth={calendar.daysInMonth}
                    firstDayOfWeek={calendar.firstDayOfWeek}
                    monthName={calendar.monthName}
                    selectedDay={calendar.selectedDayInMonth}
                    getEventsForDay={calendar.getEventsForDay}
                    isToday={calendar.isToday}
                    onSelectDay={(day) =>
                      calendar.setSelectedDate(calendar.dateStringForDay(day))
                    }
                  />
                </motion.div>

                {hasMonthEvents ? (
                  calendar.selectedDate && (
                    <DayDetailPanel
                      dateStr={calendar.selectedDate}
                      events={calendar.eventsForDate(calendar.selectedDate)}
                      hasPrev={
                        calendar.prevEventDate(calendar.selectedDate) !== null
                      }
                      hasNext={
                        calendar.nextEventDate(calendar.selectedDate) !== null
                      }
                      onPrevDay={() => {
                        const prev = calendar.prevEventDate(
                          calendar.selectedDate!,
                        );
                        if (prev) calendar.goToDate(prev);
                      }}
                      onNextDay={() => {
                        const next = calendar.nextEventDate(
                          calendar.selectedDate!,
                        );
                        if (next) calendar.goToDate(next);
                      }}
                      onSelectEvent={calendar.setSelectedEvent}
                    />
                  )
                ) : (
                  <div className="mt-4 border-t border-gold/10">
                    <EmptyMonthState
                      hasUpcoming={calendar.nextUpcomingDate !== null}
                      onJumpToNext={jumpToNextEvent}
                    />
                    {aroundStrip}
                  </div>
                )}
              </>
            ) : hasMonthEvents ? (
              <motion.div
                key={monthKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <EventListMobile
                  events={calendar.monthEvents}
                  onSelectEvent={calendar.setSelectedEvent}
                />
              </motion.div>
            ) : (
              <>
                <EmptyMonthState
                  hasUpcoming={calendar.nextUpcomingDate !== null}
                  onJumpToNext={jumpToNextEvent}
                />
                {aroundStrip}
              </>
            )}
          </div>

          <EventModal
            event={calendar.selectedEvent}
            onClose={() => calendar.setSelectedEvent(null)}
          />
        </div>
      </section>
    </MotionConfig>
  );
}
