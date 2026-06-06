/** Shared date/time formatting helpers for the events calendar. */

/** "19:00" -> "7:00 PM" */
export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/** "19:00" -> "7 PM", "19:30" -> "7:30 PM" */
export function formatTimeCompact(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return m === 0
    ? `${hour12} ${ampm}`
    : `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/** 6 -> "6th", 21 -> "21st" */
export function ordinal(n: number) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/** "2026-06-06" -> "Saturday June 6th" */
export function formatDayHeading(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toLocaleDateString("en-US", { month: "long" });
  return `${weekday} ${month} ${ordinal(d.getDate())}`;
}

/**
 * Relative pill label: "Today at 6 PM", "Tomorrow at 7 PM",
 * "Yesterday at 8 PM", else "Jun 14 at 6 PM".
 */
export function relativeDateLabel(dateStr: string, startTime?: string) {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  let dayPart: string;
  if (diffDays === 0) dayPart = "Today";
  else if (diffDays === 1) dayPart = "Tomorrow";
  else if (diffDays === -1) dayPart = "Yesterday";
  else
    dayPart = target.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return startTime ? `${dayPart} at ${formatTimeCompact(startTime)}` : dayPart;
}
