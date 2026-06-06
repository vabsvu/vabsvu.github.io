#!/usr/bin/env node
/**
 * sync-anchorlink.mjs
 *
 * Syncs Anchor Link (Anthology Engage) events into public/data/events.json.
 * Zero npm dependencies — Node 22+ only (global fetch, node:fs, node:path).
 *
 * Source: the org's sanctioned ICS export
 *   https://anchorlink.vanderbilt.edu/organization/vabs/events.ics
 * (override with env ANCHORLINK_ICS_URL). The feed lists UPCOMING events
 * only, with DTSTART/DTEND in UTC ("20260607T020000Z") or all-day DATE form.
 *
 * Synced events get ids "al_<numeric event id>" (from the UID/URL). Manual
 * events and ig_* (Instagram-derived) events are preserved, except that an
 * ig_ event colliding with an al_ event on date + normalized title is
 * dropped in favor of the structured Anchor Link version.
 *
 * SAFETY INVARIANT: on ANY failure (network, HTTP error, parse) this script
 * prints a message and exits 0 WITHOUT modifying any files. An EMPTY but
 * VALID ICS feed is NOT a failure — it simply means no upcoming events;
 * recent-past al_ events already in the file are retained (6-month window,
 * mirroring the ig_ retention in sync-instagram.mjs).
 *
 * Usage:
 *   node scripts/sync-anchorlink.mjs [--dry-run]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EVENTS_JSON = path.join(ROOT, "public", "data", "events.json");

const ICS_URL =
  process.env.ANCHORLINK_ICS_URL?.trim() ||
  "https://anchorlink.vanderbilt.edu/organization/vabs/events.ics";

const FETCH_TIMEOUT_MS = 20000;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const DRY_RUN = process.argv.includes("--dry-run");

// ---------------------------------------------------------------------------
// Small utilities (kept in sync with scripts/sync-instagram.mjs)
// ---------------------------------------------------------------------------

function log(msg) {
  console.log(`[sync-anchorlink] ${msg}`);
}

function bail(reason) {
  log(`ABORT: ${reason}`);
  log("No files were modified. Exiting 0 so CI stays green.");
  process.exit(0);
}

function readJsonFile(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** Deterministic stringify (sorted keys) so deep-compare ignores key order. */
function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** Deep-compare two data files ignoring their lastUpdated field. */
function contentChanged(oldData, newData) {
  if (!oldData) return true;
  const a = { ...oldData, lastUpdated: null };
  const b = { ...newData, lastUpdated: null };
  return stableStringify(a) !== stableStringify(b);
}

function writeJsonFile(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function truncate(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`;
}

function ymd(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---------------------------------------------------------------------------
// Mini ICS parser
// ---------------------------------------------------------------------------

/** Unescape RFC 5545 text values: \\n, \\, \\; \\\\ */
function unescapeIcs(s) {
  return s
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

/**
 * Parse ICS text into an array of VEVENT objects:
 *   { name: { params: ";VALUE=DATE", value: "..." } , ... }
 * Multi-valued properties (CATEGORIES) are accumulated into arrays.
 */
function parseIcs(text) {
  // Unfold continuation lines: CRLF (or LF) followed by a space or tab.
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);

  const events = [];
  let current = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;

    const m = line.match(/^([A-Za-z0-9-]+)((?:;[^:]*)?):(.*)$/);
    if (!m) continue;
    const name = m[1].toUpperCase();
    const entry = { params: m[2] || "", value: m[3] };
    if (name === "CATEGORIES" && current[name]) {
      // CATEGORIES may appear multiple times per VEVENT in this feed.
      current[name] = [].concat(current[name], entry);
    } else if (!current[name]) {
      current[name] = entry;
    }
  }
  return events;
}

// ---------------------------------------------------------------------------
// Date/time handling (UTC → America/Chicago, no deps)
// ---------------------------------------------------------------------------

const CHICAGO_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Convert a JS Date (UTC instant) to { date: "YYYY-MM-DD", time: "HH:MM" } in Chicago. */
function toChicago(date) {
  const parts = {};
  for (const p of CHICAGO_FMT.formatToParts(date)) {
    parts[p.type] = p.value;
  }
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

/**
 * Parse a DTSTART/DTEND entry. Returns:
 *   { allDay: true,  date: "YYYY-MM-DD" }                      for DATE values
 *   { allDay: false, date: "YYYY-MM-DD", time: "HH:MM" }       for UTC datetimes
 *   null when unparseable.
 */
function parseIcsDate(entry) {
  if (!entry) return null;
  const value = entry.value.trim();

  // All-day form: DTSTART;VALUE=DATE:20260607 (a bare 8-digit value is a
  // DATE even when the VALUE=DATE param is omitted).
  let m = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m) {
    return { allDay: true, date: `${m[1]}-${m[2]}-${m[3]}` };
  }

  // UTC datetime: 20260607T020000Z
  m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (m) {
    const utc = new Date(
      Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]),
    );
    const local = toChicago(utc);
    return { allDay: false, date: local.date, time: local.time };
  }

  // Floating / TZID local time (not expected from this feed): treat the wall
  // time as already-Chicago rather than guessing offsets.
  m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (m) {
    return {
      allDay: false,
      date: `${m[1]}-${m[2]}-${m[3]}`,
      time: `${m[4]}:${m[5]}`,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// VEVENT → CalendarEvent mapping
// ---------------------------------------------------------------------------

/** Same keyword map sync-instagram.mjs uses for caption-derived events. */
function inferCategory(text) {
  const c = text.toLowerCase();
  if (/\bshaadi\b|\bformal\b/.test(c)) return "flagship";
  if (/\bfood\b|\bdawat\b|\biftar\b|\bchai\b/.test(c)) return "food";
  if (/\bhenna\b|\bholud\b|\bboishakh\b|\bcultural\b/.test(c))
    return "cultural";
  if (/\bgbm\b|\bmeeting\b/.test(c)) return "meeting";
  return "other";
}

/** Strip the Engage boilerplate tail ("Hosted by:", "Additional Information…"). */
function cleanDescription(raw) {
  let s = raw;
  const cutMarkers = [
    /\bHosted by:/i,
    /\bAdditional Information can be found at:/i,
  ];
  for (const marker of cutMarkers) {
    const m = s.match(marker);
    if (m) s = s.slice(0, m.index);
  }
  return truncate(s.replace(/\s+/g, " ").trim(), 200);
}

/** "al_<numeric id>" from UID/URL like https://anchorlink.vanderbilt.edu/event/12471120 */
function extractEventId(vevent) {
  for (const key of ["UID", "URL"]) {
    const value = vevent[key]?.value || "";
    const m = value.match(/\/event\/(\d+)/) || value.match(/(\d{5,})/);
    if (m) return m[1];
  }
  return null;
}

function mapVevent(vevent) {
  const id = extractEventId(vevent);
  if (!id) return null;

  const start = parseIcsDate(vevent.DTSTART);
  if (!start) return null;
  const end = parseIcsDate(vevent.DTEND);

  const title = unescapeIcs(vevent.SUMMARY?.value || "").trim();
  if (!title) return null;

  const description = cleanDescription(
    unescapeIcs(vevent.DESCRIPTION?.value || ""),
  );
  const location = unescapeIcs(vevent.LOCATION?.value || "").trim();
  const url = (vevent.URL?.value || "").trim();
  const host = unescapeIcs(vevent["X-HOSTS"]?.value || "").trim();
  const categories = []
    .concat(vevent.CATEGORIES || [])
    .map((c) => unescapeIcs(c.value))
    .join(" ");

  const event = {
    id: `al_${id}`,
    title: truncate(title, 80),
    date: start.date,
    category: inferCategory(`${title} ${description} ${categories}`),
  };
  if (!start.allDay) {
    event.startTime = start.time;
    // Only attach endTime when DTEND is a timed value on the same local day
    // (multi-day spans would otherwise render as e.g. 19:00–02:00).
    if (
      end &&
      !end.allDay &&
      end.date === start.date &&
      end.time !== start.time
    ) {
      event.endTime = end.time;
    }
  }
  if (description) event.description = description;
  if (location) event.location = truncate(location, 80);
  if (url) event.eventUrl = url;
  if (host) event.host = truncate(host, 100);
  return event;
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

async function fetchIcs(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA, Accept: "text/calendar, */*" },
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} ${res.statusText} for ${url.split("?")[0]}`,
    );
  }
  const text = await res.text();
  if (!text.includes("BEGIN:VCALENDAR")) {
    throw new Error(
      `response is not an ICS calendar (got ${text.slice(0, 80)}...)`,
    );
  }
  return text;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log(`Starting Anchor Link sync${DRY_RUN ? " (dry run)" : ""}`);
  log(`Feed: ${ICS_URL}`);

  const existingEvents = readJsonFile(EVENTS_JSON);
  const existingEventList = existingEvents?.events || [];

  let icsText;
  try {
    icsText = await fetchIcs(ICS_URL);
  } catch (err) {
    bail(`fetch failed: ${err.message}`);
  }

  let vevents;
  try {
    vevents = parseIcs(icsText);
  } catch (err) {
    bail(`ICS parse failed: ${err.message}`);
  }
  log(`Parsed ${vevents.length} VEVENT(s) from feed.`);

  const freshAlEvents = [];
  for (const vevent of vevents) {
    const event = mapVevent(vevent);
    if (event) {
      freshAlEvents.push(event);
      log(
        `  event parsed:    ${event.date}${event.startTime ? ` ${event.startTime}` : ""}` +
          `  "${event.title}"`,
      );
    } else {
      log(`  event skipped:   unmappable VEVENT (missing id/date/title)`);
    }
  }
  if (vevents.length === 0) {
    log("Feed is a valid, empty calendar — no upcoming Anchor Link events.");
  }

  const normTitle = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  // Manual events = ids with no sync prefix; always preserved verbatim.
  const manualEvents = existingEventList.filter(
    (e) => !String(e.id).startsWith("al_") && !String(e.id).startsWith("ig_"),
  );
  const igEvents = existingEventList.filter((e) =>
    String(e.id).startsWith("ig_"),
  );

  // Skip an al_ event a manual event already covers (same date + title) —
  // officers' curated entries win.
  const coveredByManual = (event) =>
    manualEvents.some(
      (m) =>
        m.date === event.date && normTitle(m.title) === normTitle(event.title),
    );
  const keptFresh = freshAlEvents.filter((e) => {
    if (coveredByManual(e)) {
      log(
        `  event deferred:  ${e.date}  "${e.title}" (manual event covers it)`,
      );
      return false;
    }
    return true;
  });

  // The feed only lists upcoming events; keep previously synced al_ events
  // that fell off the feed if they are recent (within ~6 months — mirrors
  // the ig_ retention in sync-instagram.mjs).
  const retentionCutoff = new Date();
  retentionCutoff.setUTCMonth(retentionCutoff.getUTCMonth() - 6);
  const cutoffStr = ymd(retentionCutoff);
  const freshIds = new Set(keptFresh.map((e) => e.id));
  const freshDates = new Set(keptFresh.map((e) => e.date));
  const retainedAlEvents = existingEventList.filter(
    (e) =>
      String(e.id).startsWith("al_") &&
      !freshIds.has(e.id) &&
      !freshDates.has(e.date) &&
      typeof e.date === "string" &&
      e.date >= cutoffStr &&
      !coveredByManual(e),
  );
  for (const event of retainedAlEvents) {
    log(`  event retained:  ${event.date}  "${event.title}"`);
  }

  const allAlEvents = [...keptFresh, ...retainedAlEvents];

  // An ig_ event colliding with an al_ event (date + normalized title) is
  // dropped — the structured Anchor Link data wins over caption heuristics.
  const coveredByAl = (event) =>
    allAlEvents.some(
      (a) =>
        a.date === event.date && normTitle(a.title) === normTitle(event.title),
    );
  const keptIgEvents = igEvents.filter((e) => {
    if (coveredByAl(e)) {
      log(`  ig event dropped: ${e.date}  "${e.title}" (al_ event covers it)`);
      return false;
    }
    return true;
  });

  const mergedEvents = [...manualEvents, ...keptIgEvents, ...allAlEvents].sort(
    (a, b) =>
      a.date === b.date
        ? (a.startTime || "").localeCompare(b.startTime || "")
        : a.date.localeCompare(b.date),
  );

  const newEventsData = {
    lastUpdated: new Date().toISOString(),
    events: mergedEvents,
  };

  const eventsChanged = contentChanged(existingEvents, newEventsData);
  log(
    `events.json: ${eventsChanged ? "CHANGED" : "unchanged"} ` +
      `(${manualEvents.length} manual + ${keptIgEvents.length} instagram + ` +
      `${keptFresh.length} fresh + ${retainedAlEvents.length} retained from Anchor Link)`,
  );

  if (DRY_RUN) {
    if (eventsChanged) {
      log("--dry-run: would write events.json:");
      console.log(JSON.stringify(newEventsData, null, 2));
    }
    log("Dry run complete. Nothing written.");
    return;
  }

  if (eventsChanged) {
    writeJsonFile(EVENTS_JSON, newEventsData);
    log(`Wrote ${path.relative(ROOT, EVENTS_JSON)}`);
  } else {
    log("Everything already up to date. Nothing written.");
  }
  log("Sync complete.");
}

main().catch((err) => {
  // Safety invariant: never fail the workflow, never leave partial JSON.
  log(`Unexpected error: ${err.stack || err.message}`);
  log("No data files were modified. Exiting 0.");
  process.exit(0);
});
