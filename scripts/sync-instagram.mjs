#!/usr/bin/env node
/**
 * sync-instagram.mjs
 *
 * Syncs public/data/posts.json and public/data/events.json from the club's
 * Instagram account (@vandy.bengalis). Zero npm dependencies — Node 22+ only
 * (global fetch, node:fs, node:path, node:crypto).
 *
 * Source priority:
 *   1. Instagram Graph API        (env IG_ACCESS_TOKEN, optional IG_BUSINESS_ID)
 *   2. Behold.so JSON feed        (env BEHOLD_FEED_URL)
 *   3. Public web_profile_info endpoint (no credentials; often blocked from
 *      datacenter IPs — failure here is expected and harmless)
 *
 * SAFETY INVARIANT: on ANY failure (network, auth, parse, too few posts) this
 * script prints a message and exits 0 WITHOUT modifying any files. The site
 * never loses data because a sync failed.
 *
 * Usage:
 *   node scripts/sync-instagram.mjs [--dry-run]
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_JSON = path.join(ROOT, "public", "data", "posts.json");
const EVENTS_JSON = path.join(ROOT, "public", "data", "events.json");
const IMAGES_DIR = path.join(ROOT, "public", "images", "insta");

const IG_USERNAME = "vandy.bengalis";
const POST_LIMIT = 12;
const MIN_POSTS = 3; // abort if a fetch yields fewer posts than this
const FETCH_TIMEOUT_MS = 20000;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const DRY_RUN = process.argv.includes("--dry-run");

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

function log(msg) {
  console.log(`[sync-instagram] ${msg}`);
}

function bail(reason) {
  log(`ABORT: ${reason}`);
  log("No files were modified. Exiting 0 so CI stays green.");
  process.exit(0);
}

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, {
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} ${res.statusText} for ${url.split("?")[0]}`,
    );
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Response from ${url.split("?")[0]} was not JSON (got ${text.slice(0, 80)}...)`,
    );
  }
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

function sanitizeKey(s) {
  return String(s).replace(/[^A-Za-z0-9_-]/g, "");
}

function stripEdgeEmoji(s) {
  const edge =
    /^[\s\p{Extended_Pictographic}\p{Emoji_Presentation}\u{FE0F}\u{200D}\u{20E3}*#!.,:;|~-]+|[\s\p{Extended_Pictographic}\p{Emoji_Presentation}\u{FE0F}\u{200D}\u{20E3}*~|-]+$/gu;
  return s.replace(edge, "").trim();
}

function truncate(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`;
}

// ---------------------------------------------------------------------------
// Source 1: Instagram Graph API
// ---------------------------------------------------------------------------

const MEDIA_FIELDS =
  "id,caption,media_url,media_type,thumbnail_url,permalink,timestamp," +
  "children{media_url,media_type,thumbnail_url}";

function pickGraphImageUrl(item) {
  if (item.media_type === "VIDEO") {
    return item.thumbnail_url || null;
  }
  if (item.media_type === "CAROUSEL_ALBUM") {
    const first = item.children?.data?.[0];
    if (first) {
      return first.media_type === "VIDEO"
        ? first.thumbnail_url || item.thumbnail_url || null
        : first.media_url || null;
    }
    return item.thumbnail_url || item.media_url || null;
  }
  return item.media_url || null;
}

async function fetchFromGraphApi(token, businessId) {
  let items;
  if (businessId) {
    log("Source: Instagram Graph API (business discovery)");
    const url =
      `https://graph.facebook.com/v21.0/${encodeURIComponent(businessId)}` +
      `?fields=business_discovery.username(${IG_USERNAME})` +
      `{media.limit(${POST_LIMIT}){${MEDIA_FIELDS}}}` +
      `&access_token=${encodeURIComponent(token)}`;
    const json = await fetchJson(url);
    items = json?.business_discovery?.media?.data;
  } else {
    log("Source: Instagram Graph API (/me/media)");
    const url =
      `https://graph.instagram.com/me/media` +
      `?fields=${encodeURIComponent(MEDIA_FIELDS)}` +
      `&limit=${POST_LIMIT}&access_token=${encodeURIComponent(token)}`;
    const json = await fetchJson(url);
    items = json?.data;
  }
  if (!Array.isArray(items))
    throw new Error("Graph API returned no media array");

  return items.map((item) => {
    const shortcodeMatch = (item.permalink || "").match(
      /\/(?:p|reel|tv)\/([^/?]+)/,
    );
    return {
      key: sanitizeKey(shortcodeMatch ? shortcodeMatch[1] : item.id),
      caption: item.caption || "",
      imageSourceUrl: pickGraphImageUrl(item),
      permalink: item.permalink || `https://www.instagram.com/${IG_USERNAME}/`,
      timestamp: new Date(item.timestamp).toISOString(),
    };
  });
}

// ---------------------------------------------------------------------------
// Source 2: Behold.so feed
// ---------------------------------------------------------------------------

async function fetchFromBehold(feedUrl) {
  log("Source: Behold.so feed");
  const json = await fetchJson(feedUrl, { "User-Agent": BROWSER_UA });
  const items = Array.isArray(json) ? json : json.posts || json.media || [];
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Behold feed returned no posts");
  }

  return items.map((item) => {
    const permalink =
      item.permalink || `https://www.instagram.com/${IG_USERNAME}/`;
    const shortcodeMatch = permalink.match(/\/(?:p|reel|tv)\/([^/?]+)/);
    const isVideo = (item.mediaType || "").toUpperCase() === "VIDEO";
    const imageSourceUrl =
      (isVideo && (item.thumbnailUrl || item.thumbnail_url)) ||
      item.sizes?.medium?.mediaUrl ||
      item.sizes?.full?.mediaUrl ||
      item.mediaUrl ||
      item.media_url ||
      item.thumbnailUrl ||
      null;
    return {
      key: sanitizeKey(shortcodeMatch ? shortcodeMatch[1] : item.id),
      caption: item.caption || item.prunedCaption || "",
      imageSourceUrl,
      permalink,
      timestamp: new Date(item.timestamp).toISOString(),
    };
  });
}

// ---------------------------------------------------------------------------
// Source 3: best-effort public endpoint (no credentials)
// ---------------------------------------------------------------------------

async function fetchFromPublicEndpoint() {
  log("Source: public web_profile_info endpoint (best effort)");
  const url =
    `https://www.instagram.com/api/v1/users/web_profile_info/` +
    `?username=${IG_USERNAME}`;
  const json = await fetchJson(url, {
    "User-Agent": BROWSER_UA,
    "x-ig-app-id": "936619743392459",
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: `https://www.instagram.com/${IG_USERNAME}/`,
  });
  const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges;
  if (!Array.isArray(edges))
    throw new Error("Public endpoint returned no media edges");

  return edges.map(({ node }) => ({
    key: sanitizeKey(node.shortcode || node.id),
    caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || "",
    imageSourceUrl: node.display_url || null,
    permalink: `https://www.instagram.com/p/${node.shortcode}/`,
    timestamp: new Date(node.taken_at_timestamp * 1000).toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Source dispatcher
// ---------------------------------------------------------------------------

async function fetchPosts() {
  const token = process.env.IG_ACCESS_TOKEN?.trim();
  const businessId = process.env.IG_BUSINESS_ID?.trim();
  const beholdUrl = process.env.BEHOLD_FEED_URL?.trim();

  if (token) return fetchFromGraphApi(token, businessId);
  if (beholdUrl) return fetchFromBehold(beholdUrl);
  return fetchFromPublicEndpoint();
}

// ---------------------------------------------------------------------------
// Image localization
// ---------------------------------------------------------------------------

async function downloadImage(sourceUrl, destFile) {
  const res = await fetch(sourceUrl, {
    headers: {
      "User-Agent": BROWSER_UA,
      Referer: "https://www.instagram.com/",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`unexpected content-type ${contentType}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error("image payload suspiciously small");
  fs.writeFileSync(destFile, buf);
  return buf.length;
}

// ---------------------------------------------------------------------------
// Thumbnails (192x192 center crop next to the full image, <basename>_thumb.jpg)
//
// Best-effort: uses ImageMagick ("magick"/"convert", preinstalled on ubuntu
// GH runners) or "sips" (macOS). When neither is available, or a generation
// fails, the thumb is skipped silently — events simply omit thumbUrl and the
// UI falls back to imageUrl. Thumbnailing must never fail the sync.
// ---------------------------------------------------------------------------

const THUMB_SIZE = 192;
const TOOL_TIMEOUT_MS = 30000;

function toolWorks(cmd, args) {
  try {
    const r = spawnSync(cmd, args, {
      stdio: "ignore",
      timeout: TOOL_TIMEOUT_MS,
    });
    return r.status === 0;
  } catch {
    return false;
  }
}

let thumbToolCache;
function resolveThumbTool() {
  if (thumbToolCache !== undefined) return thumbToolCache;
  if (toolWorks("magick", ["-version"])) thumbToolCache = "magick";
  else if (toolWorks("convert", ["-version"])) thumbToolCache = "convert";
  else if (toolWorks("sips", ["--help"])) thumbToolCache = "sips";
  else thumbToolCache = null;
  log(
    thumbToolCache
      ? `Thumbnail tool: ${thumbToolCache}`
      : "Thumbnail tool: none found (magick/convert/sips) — thumbnails skipped",
  );
  return thumbToolCache;
}

/** Write a 192x192 center-cropped JPEG thumb. Returns true on success. */
function generateThumb(sourceFile, destFile) {
  const tool = resolveThumbTool();
  if (!tool) return false;
  try {
    if (tool === "magick" || tool === "convert") {
      const size = `${THUMB_SIZE}x${THUMB_SIZE}`;
      const r = spawnSync(
        tool,
        // resize ^ = fill (short side hits 192), then center-crop to square.
        [
          sourceFile,
          "-auto-orient",
          "-resize",
          `${size}^`,
          "-gravity",
          "center",
          "-extent",
          size,
          "-strip",
          "-quality",
          "82",
          destFile,
        ],
        { stdio: "ignore", timeout: TOOL_TIMEOUT_MS },
      );
      return (
        r.status === 0 &&
        fs.existsSync(destFile) &&
        fs.statSync(destFile).size > 0
      );
    }
    // sips: probe dimensions, resample the SHORT side to 192 (so the crop
    // covers the full square), then center-crop in place (-c crops centered).
    const probe = spawnSync(
      "sips",
      ["-g", "pixelWidth", "-g", "pixelHeight", sourceFile],
      {
        encoding: "utf8",
        timeout: TOOL_TIMEOUT_MS,
      },
    );
    if (probe.status !== 0) return false;
    const width = Number(/pixelWidth:\s*(\d+)/.exec(probe.stdout || "")?.[1]);
    const height = Number(/pixelHeight:\s*(\d+)/.exec(probe.stdout || "")?.[1]);
    if (!width || !height) return false;
    const resampleFlag =
      width <= height ? "--resampleWidth" : "--resampleHeight";
    const resample = spawnSync(
      "sips",
      [
        "-s",
        "format",
        "jpeg",
        resampleFlag,
        String(THUMB_SIZE),
        sourceFile,
        "--out",
        destFile,
      ],
      { stdio: "ignore", timeout: TOOL_TIMEOUT_MS },
    );
    if (resample.status !== 0 || !fs.existsSync(destFile)) return false;
    const crop = spawnSync(
      "sips",
      ["-c", String(THUMB_SIZE), String(THUMB_SIZE), destFile],
      { stdio: "ignore", timeout: TOOL_TIMEOUT_MS },
    );
    return crop.status === 0 && fs.statSync(destFile).size > 0;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Event extraction from captions
// ---------------------------------------------------------------------------

const MONTHS = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};
const WEEKDAYS = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const MONTH_DATE_RE =
  /\b(?:(?:sun|mon|tues?|wed(?:nes)?|thu(?:rs)?|fri|sat(?:ur)?)day,?\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b/i;
const NUMERIC_DATE_RE = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/;
const RELATIVE_DATE_RE =
  /\b(?:this|next)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i;

function ymd(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Pick a year so the event lands near (>= ~3 weeks before) the post date. */
function inferYear(month, day, postDate) {
  const tolerance = 21 * 86400000;
  for (const year of [
    postDate.getUTCFullYear(),
    postDate.getUTCFullYear() + 1,
  ]) {
    const candidate = new Date(Date.UTC(year, month, day));
    if (candidate.getTime() >= postDate.getTime() - tolerance) return candidate;
  }
  return null;
}

function extractDate(caption, postDate) {
  let m = caption.match(MONTH_DATE_RE);
  if (m) {
    const month = MONTHS[m[1].slice(0, 3).toLowerCase()];
    const day = Number(m[2]);
    if (day >= 1 && day <= 31) {
      if (m[3]) return new Date(Date.UTC(Number(m[3]), month, day));
      return inferYear(month, day, postDate);
    }
  }
  m = caption.match(NUMERIC_DATE_RE);
  // Ignore "10/10"-style ratings (same number, no year).
  if (m && !(m[1] === m[2] && !m[3])) {
    const month = Number(m[1]) - 1;
    const day = Number(m[2]);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      if (m[3]) {
        const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
        return new Date(Date.UTC(year, month, day));
      }
      return inferYear(month, day, postDate);
    }
  }
  m = caption.match(RELATIVE_DATE_RE);
  if (m) {
    const target = WEEKDAYS[m[1].toLowerCase()];
    const d = new Date(postDate.getTime());
    const delta = (target - d.getUTCDay() + 7) % 7 || 7;
    d.setUTCDate(d.getUTCDate() + delta);
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
  }
  if (/\btomorrow\b/i.test(caption)) {
    const d = new Date(postDate.getTime() + 86400000);
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
  }
  if (/\btonight\b|\btoday\b/i.test(caption)) {
    return new Date(
      Date.UTC(
        postDate.getUTCFullYear(),
        postDate.getUTCMonth(),
        postDate.getUTCDate(),
      ),
    );
  }
  return null;
}

const TIME_RANGE_RE =
  /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|—|to|until)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
const TIME_SINGLE_RE = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;

function to24h(hourStr, minStr, meridiem) {
  let h = Number(hourStr);
  const min = minStr ? Number(minStr) : 0;
  if (h < 1 || h > 12 || min > 59) return null;
  const mer = meridiem.toLowerCase();
  if (mer === "pm" && h < 12) h += 12;
  if (mer === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

const TIME_RANGE_BARE_RE =
  /\b(\d{1,2}):(\d{2})\s*(?:-|–|—|to|until)\s*(\d{1,2}):(\d{2})\b/;

function resolveRange(sH, sM, sMer, eH, eM, eMer) {
  let start = to24h(sH, sM, sMer);
  const end = to24h(eH, eM, eMer);
  // "11-1pm" → start should be 11am, not 11pm
  if (start && end && start >= end) {
    start = to24h(sH, sM, sMer.toLowerCase() === "pm" ? "am" : "pm");
  }
  if (start && end && start < end) return { startTime: start, endTime: end };
  return null;
}

function extractTimes(caption) {
  const range = caption.match(TIME_RANGE_RE);
  if (range) {
    const endMer = range[6];
    const startMer = range[3] || endMer;
    const resolved = resolveRange(
      range[1],
      range[2],
      startMer,
      range[4],
      range[5],
      endMer,
    );
    if (resolved) return resolved;
  }
  // Range with explicit minutes but no am/pm (e.g. "4:30–7:30", "11:30–1:00").
  // Club events are afternoon/evening: assume the end time is PM when its
  // hour is unambiguous (≤ 8), otherwise skip rather than guess.
  const bare = caption.match(TIME_RANGE_BARE_RE);
  if (bare && Number(bare[3]) >= 1 && Number(bare[3]) <= 8) {
    const resolved = resolveRange(
      bare[1],
      bare[2],
      "pm",
      bare[3],
      bare[4],
      "pm",
    );
    if (resolved) return resolved;
  }
  const single = caption.match(TIME_SINGLE_RE);
  if (single) {
    const start = to24h(single[1], single[2], single[3]);
    if (start) return { startTime: start };
  }
  return {};
}

const LOCATION_STOPWORDS = new RegExp(
  `^(?:${Object.keys(WEEKDAYS).join("|")}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec` +
    `|bangladesh|bengal|bengali|bangla|bd|vabs|instagram)\\b`,
  "i",
);

function extractLocation(caption) {
  for (const line of caption.split("\n")) {
    const m = line.match(/^\s*(?:📍|Location:|Where:)\s*(.+)$/iu);
    if (m) {
      const loc = m[1].replace(/[\s!.,;|~-]+$/u, "").trim();
      if (loc) return truncate(stripEdgeEmoji(loc), 60);
    }
  }
  // "at/in <Capitalized Place>" — no "." in word chars so we never cross a
  // sentence boundary ("in Bangladesh. Bring your friends" → "Bangladesh").
  const m = caption.match(
    /\b(?:at|in|on)\s+(?:the\s+)?([A-Z][\w''&-]*(?:\s+(?:of|the|[A-Z][\w''&-]*)){0,4})/,
  );
  if (m && !LOCATION_STOPWORDS.test(m[1])) {
    return truncate(m[1].replace(/[.,;:!]+$/, "").trim(), 60);
  }
  return undefined;
}

function inferCategory(caption) {
  const c = caption.toLowerCase();
  if (/\bshaadi\b|\bformal\b/.test(c)) return "flagship";
  if (/\bfood\b|\bdawat\b|\biftar\b/.test(c)) return "food";
  if (/\bhenna\b|\bholud\b|\bboishakh\b|\bcultural\b/.test(c))
    return "cultural";
  if (/\bgbm\b|\bmeeting\b/.test(c)) return "meeting";
  return "other";
}

/** Returns a CalendarEvent or null if the caption has no confident event date. */
function extractEvent(post, localImageUrl, localThumbUrl) {
  const caption = post.caption || "";
  if (!caption.trim()) return null;

  const postDate = new Date(post.timestamp);
  const eventDate = extractDate(caption, postDate);
  if (!eventDate) return null;

  // Confidence window: recent past (recap posts) through ~13 months ahead.
  const deltaMs = eventDate.getTime() - postDate.getTime();
  if (deltaMs < -30 * 86400000 || deltaMs > 400 * 86400000) return null;

  const firstLine =
    caption
      .split("\n")
      .map((l) => stripEdgeEmoji(l))
      .find((l) => l.length > 0) || "VABS Event";

  const event = {
    id: `ig_${post.key}`,
    title: truncate(firstLine, 60),
    date: ymd(eventDate),
    ...extractTimes(caption),
    category: inferCategory(caption),
    description: truncate(caption.replace(/\s+/g, " ").trim(), 200),
    imageUrl: localImageUrl,
    instagramPermalink: post.permalink,
  };
  if (localThumbUrl) event.thumbUrl = localThumbUrl;
  const location = extractLocation(caption);
  if (location) event.location = location;
  return event;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log(`Starting sync for @${IG_USERNAME}${DRY_RUN ? " (dry run)" : ""}`);

  const existingPosts = readJsonFile(POSTS_JSON);
  const existingEvents = readJsonFile(EVENTS_JSON);

  let fetched;
  try {
    fetched = await fetchPosts();
  } catch (err) {
    bail(`fetch failed: ${err.message}`);
  }

  fetched = (fetched || [])
    .filter((p) => p.key && p.imageSourceUrl && p.permalink)
    .slice(0, POST_LIMIT);

  log(`Fetched ${fetched.length} posts from Instagram.`);
  if (fetched.length < MIN_POSTS) {
    bail(
      `fetch returned ${fetched.length} posts (< ${MIN_POSTS}); refusing to ` +
        `shrink existing data (currently ${existingPosts?.posts?.length ?? 0} posts).`,
    );
  }

  // Localize images: IG CDN URLs are signed and expire, so we must self-host.
  // Downloads are staged in a temp dir and only moved into public/ at the
  // final write step, so a bail or unexpected error after this loop leaves
  // the repo untouched (safety invariant — otherwise CI would commit and
  // deploy orphan images from a failed sync).
  const stagingDir = DRY_RUN
    ? null
    : fs.mkdtempSync(path.join(os.tmpdir(), "vabs-ig-sync-"));
  const stagedImages = [];
  const localized = [];
  for (const post of fetched) {
    const fileName = `ig_${post.key}.jpg`;
    const thumbName = `ig_${post.key}_thumb.jpg`;
    const destFile = path.join(IMAGES_DIR, fileName);
    const destThumb = path.join(IMAGES_DIR, thumbName);
    const localUrl = `/images/insta/${fileName}`;
    const localThumb = `/images/insta/${thumbName}`;

    // Best-effort thumb staging; returns the local thumb URL or undefined.
    const stageThumb = (sourceFile) => {
      if (fs.existsSync(destThumb)) return localThumb;
      if (DRY_RUN) return undefined; // don't write during dry runs
      const stagedThumbFile = path.join(stagingDir, thumbName);
      if (generateThumb(sourceFile, stagedThumbFile)) {
        stagedImages.push({ from: stagedThumbFile, to: destThumb });
        log(`  thumb generated:  ${thumbName}`);
        return localThumb;
      }
      log(`  thumb skipped:    ${thumbName} (generation unavailable/failed)`);
      return undefined;
    };

    if (fs.existsSync(destFile)) {
      log(`  image cached:     ${fileName}`);
      localized.push({
        ...post,
        localImageUrl: localUrl,
        localThumbUrl: stageThumb(destFile),
      });
      continue;
    }
    if (DRY_RUN) {
      log(`  image would download: ${fileName}`);
      localized.push({
        ...post,
        localImageUrl: localUrl,
        localThumbUrl: undefined,
      });
      continue;
    }
    try {
      const stagedFile = path.join(stagingDir, fileName);
      const bytes = await downloadImage(post.imageSourceUrl, stagedFile);
      log(`  image downloaded: ${fileName} (${Math.round(bytes / 1024)} KB)`);
      stagedImages.push({ from: stagedFile, to: destFile });
      localized.push({
        ...post,
        localImageUrl: localUrl,
        localThumbUrl: stageThumb(stagedFile),
      });
    } catch (err) {
      log(`  image FAILED:     ${fileName} (${err.message}) — skipping post`);
    }
  }

  if (localized.length < MIN_POSTS) {
    bail(
      `only ${localized.length} posts have usable images (< ${MIN_POSTS}); ` +
        `keeping existing data.`,
    );
  }

  // ---- posts.json -----------------------------------------------------------
  const newPostsData = {
    lastUpdated: new Date().toISOString(),
    posts: localized.map((p) => ({
      id: `ig_${p.key}`,
      caption: p.caption,
      imageUrl: p.localImageUrl,
      timestamp: p.timestamp,
      permalink: p.permalink,
    })),
  };

  // ---- events.json ----------------------------------------------------------
  const candidates = [];
  for (const post of localized) {
    const event = extractEvent(post, post.localImageUrl, post.localThumbUrl);
    if (event) candidates.push({ event, postTime: post.timestamp });
  }
  // Multiple posts often hype the same event (announcement, reminder,
  // day-of). Dedupe by date: keep the event from the most recent post and
  // backfill any time/location details it lacks from the older posts.
  const byDate = new Map();
  candidates.sort((a, b) => b.postTime.localeCompare(a.postTime));
  for (const { event } of candidates) {
    const kept = byDate.get(event.date);
    if (!kept) {
      byDate.set(event.date, event);
    } else {
      for (const field of ["startTime", "endTime", "location"]) {
        if (!kept[field] && event[field]) kept[field] = event[field];
      }
    }
  }
  const igEvents = [...byDate.values()];
  for (const event of igEvents) {
    log(`  event extracted:  ${event.date}  "${event.title}"`);
  }
  // Preserve all manually curated events (ids NOT starting with "ig_").
  const existingEventList = existingEvents?.events || [];
  const manualEvents = existingEventList.filter(
    (e) => !String(e.id).startsWith("ig_"),
  );
  // Officers correct a wrong auto-event by copying it into a manual entry
  // (docs/INSTAGRAM_SYNC.md) — drop any ig_ event a manual event already
  // covers (same Instagram post, or same date + title), so the correction
  // doesn't reappear as a duplicate on the next sync.
  const normTitle = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  const coveredByManual = (event) =>
    manualEvents.some(
      (m) =>
        (m.instagramPermalink &&
          m.instagramPermalink === event.instagramPermalink) ||
        (m.date === event.date &&
          normTitle(m.title) === normTitle(event.title)),
    );
  const freshIgEvents = igEvents.filter((e) => !coveredByManual(e));
  // Posts rotate out of the latest-N fetch window, but their events should
  // not silently vanish: keep previously synced ig_ events that were not
  // re-derived this run, as long as they are upcoming or recent (within ~6
  // months) and don't collide with a fresh extraction or a manual event.
  const retentionCutoff = new Date();
  retentionCutoff.setUTCMonth(retentionCutoff.getUTCMonth() - 6);
  const cutoffStr = ymd(retentionCutoff);
  const freshIds = new Set(freshIgEvents.map((e) => e.id));
  const freshDates = new Set(freshIgEvents.map((e) => e.date));
  const retainedIgEvents = existingEventList.filter(
    (e) =>
      String(e.id).startsWith("ig_") &&
      !freshIds.has(e.id) &&
      !freshDates.has(e.date) &&
      typeof e.date === "string" &&
      e.date >= cutoffStr &&
      !coveredByManual(e),
  );
  for (const event of retainedIgEvents) {
    log(`  event retained:   ${event.date}  "${event.title}"`);
  }
  const mergedEvents = [
    ...manualEvents,
    ...freshIgEvents,
    ...retainedIgEvents,
  ].sort((a, b) =>
    a.date === b.date
      ? (a.startTime || "").localeCompare(b.startTime || "")
      : a.date.localeCompare(b.date),
  );
  const newEventsData = {
    lastUpdated: new Date().toISOString(),
    events: mergedEvents,
  };

  // ---- change detection & write ---------------------------------------------
  const postsChanged = contentChanged(existingPosts, newPostsData);
  const eventsChanged = contentChanged(existingEvents, newEventsData);

  log(
    `posts.json:  ${postsChanged ? "CHANGED" : "unchanged"} (${newPostsData.posts.length} posts)`,
  );
  log(
    `events.json: ${eventsChanged ? "CHANGED" : "unchanged"} ` +
      `(${manualEvents.length} manual + ${freshIgEvents.length} fresh + ` +
      `${retainedIgEvents.length} retained from Instagram)`,
  );

  if (DRY_RUN) {
    if (postsChanged) {
      log("--dry-run: would write posts.json:");
      console.log(JSON.stringify(newPostsData, null, 2));
    }
    if (eventsChanged) {
      log("--dry-run: would write events.json:");
      console.log(JSON.stringify(newEventsData, null, 2));
    }
    log("Dry run complete. Nothing written.");
    return;
  }

  // Move staged images into public/ only now that every bail condition has
  // passed — a failed sync must never leave files for CI to commit.
  if (stagedImages.length > 0) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    for (const { from, to } of stagedImages) {
      fs.copyFileSync(from, to);
    }
    log(
      `Moved ${stagedImages.length} new image(s) into ` +
        `${path.relative(ROOT, IMAGES_DIR)}`,
    );
  }
  if (stagingDir) fs.rmSync(stagingDir, { recursive: true, force: true });

  if (postsChanged) {
    writeJsonFile(POSTS_JSON, newPostsData);
    log(`Wrote ${path.relative(ROOT, POSTS_JSON)}`);
  }
  if (eventsChanged) {
    writeJsonFile(EVENTS_JSON, newEventsData);
    log(`Wrote ${path.relative(ROOT, EVENTS_JSON)}`);
  }
  if (!postsChanged && !eventsChanged) {
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
