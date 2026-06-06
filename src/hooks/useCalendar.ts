import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { CalendarEvent } from "../types/events";

const pad = (n: number) => String(n).padStart(2, "0");

function toDateString(year: number, monthIndex: number, day: number) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

export function useCalendar(events: CalendarEvent[]) {
  const now = new Date();
  const todayStr = toDateString(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Events grouped by YYYY-MM-DD, each day's list sorted by start time
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.date);
      if (list) list.push(event);
      else map.set(event.date, [event]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
    }
    return map;
  }, [events]);

  // Sorted unique dates that have at least one event
  const eventDates = useMemo(
    () => [...eventsByDate.keys()].sort(),
    [eventsByDate],
  );

  const eventsForDate = useCallback(
    (dateStr: string) => eventsByDate.get(dateStr) ?? [],
    [eventsByDate],
  );

  const hasEventsOn = useCallback(
    (dateStr: string) => eventsByDate.has(dateStr),
    [eventsByDate],
  );

  /** Next date strictly after `dateStr` that has events, across all loaded data */
  const nextEventDate = useCallback(
    (dateStr: string) => eventDates.find((d) => d > dateStr) ?? null,
    [eventDates],
  );

  /** Last date strictly before `dateStr` that has events, across all loaded data */
  const prevEventDate = useCallback(
    (dateStr: string) => {
      for (let i = eventDates.length - 1; i >= 0; i--) {
        if (eventDates[i] < dateStr) return eventDates[i];
      }
      return null;
    },
    [eventDates],
  );

  /** First event date that is today or later, or null if none */
  const nextUpcomingDate = useMemo(
    () => eventDates.find((d) => d >= todayStr) ?? null,
    [eventDates, todayStr],
  );

  const dateStringForDay = useCallback(
    (day: number) => toDateString(currentYear, currentMonth, day),
    [currentYear, currentMonth],
  );

  const monthEvents = useMemo(() => {
    const prefix = `${currentYear}-${pad(currentMonth + 1)}`;
    return events.filter((e) => e.date.startsWith(prefix));
  }, [events, currentYear, currentMonth]);

  /**
   * The nearest events on either side of the visible month: the last two
   * before it and the first two after it (chronological order). Feeds the
   * "Recently & up next" strip so sparse months still feel alive.
   */
  const aroundMonthEvents = useMemo(() => {
    const prefix = `${currentYear}-${pad(currentMonth + 1)}`;
    const sorted = [...events].sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.startTime ?? "").localeCompare(b.startTime ?? ""),
    );
    return {
      before: sorted.filter((e) => e.date.slice(0, 7) < prefix).slice(-2),
      after: sorted.filter((e) => e.date.slice(0, 7) > prefix).slice(0, 2),
    };
  }, [events, currentYear, currentMonth]);

  const getEventsForDay = useCallback(
    (day: number) => eventsForDate(dateStringForDay(day)),
    [eventsForDate, dateStringForDay],
  );

  const firstEventDateInMonth = useCallback(
    (year: number, monthIndex: number) => {
      const prefix = `${year}-${pad(monthIndex + 1)}`;
      return eventDates.find((d) => d.startsWith(prefix)) ?? null;
    },
    [eventDates],
  );

  const goNextMonth = () => {
    const year = currentMonth === 11 ? currentYear + 1 : currentYear;
    const month = (currentMonth + 1) % 12;
    setCurrentYear(year);
    setCurrentMonth(month);
    setSelectedDate(firstEventDateInMonth(year, month));
  };

  const goPrevMonth = () => {
    const year = currentMonth === 0 ? currentYear - 1 : currentYear;
    const month = (currentMonth + 11) % 12;
    setCurrentYear(year);
    setCurrentMonth(month);
    setSelectedDate(firstEventDateInMonth(year, month));
  };

  const goToday = () => {
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  /** Navigate the visible month to contain `dateStr` and select it */
  const goToDate = useCallback((dateStr: string) => {
    const [y, m] = dateStr.split("-").map(Number);
    setCurrentYear(y);
    setCurrentMonth(m - 1);
    setSelectedDate(dateStr);
  }, []);

  // Default selection once events load: today if it has events, else the
  // next upcoming event date if it falls within the visible month.
  const defaultApplied = useRef(false);
  useEffect(() => {
    if (defaultApplied.current || events.length === 0) return;
    defaultApplied.current = true;
    if (eventsByDate.has(todayStr)) {
      setSelectedDate(todayStr);
      return;
    }
    const next = eventDates.find((d) => d > todayStr);
    if (next && next.startsWith(`${currentYear}-${pad(currentMonth + 1)}`)) {
      setSelectedDate(next);
    }
  }, [events, eventsByDate, eventDates, todayStr, currentYear, currentMonth]);

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "en-US",
    { month: "long" },
  );

  const isToday = (day: number) => dateStringForDay(day) === todayStr;

  /** Selected date's day-of-month if it's in the visible month, else null */
  const selectedDayInMonth = useMemo(() => {
    if (!selectedDate) return null;
    const [y, m, d] = selectedDate.split("-").map(Number);
    return y === currentYear && m - 1 === currentMonth ? d : null;
  }, [selectedDate, currentYear, currentMonth]);

  return {
    currentYear,
    currentMonth,
    monthName,
    daysInMonth,
    firstDayOfWeek,
    monthEvents,
    aroundMonthEvents,
    selectedEvent,
    setSelectedEvent,
    selectedDate,
    setSelectedDate,
    selectedDayInMonth,
    todayStr,
    dateStringForDay,
    eventsForDate,
    hasEventsOn,
    nextEventDate,
    prevEventDate,
    nextUpcomingDate,
    getEventsForDay,
    goNextMonth,
    goPrevMonth,
    goToday,
    goToDate,
    isToday,
  };
}
