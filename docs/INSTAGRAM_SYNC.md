# Content Sync — Technical Reference

> **Just want to keep the site updated as an officer?** You probably want the
> [Officer Guide](OFFICER_GUIDE.md) — it covers posting tips, editing events
> by hand, and the new-officer checklist. This document is the technical
> deep-dive: how the sync works internally and how to set up (or fix) the
> Instagram connection.

The website pulls content from two sources, twice a day (5am & 5pm UTC):

- **Instagram** ([@vandy.bengalis](https://www.instagram.com/vandy.bengalis/))
  → `scripts/sync-instagram.mjs` → feed posts + best-effort event detection
  from captions (`ig_*` event ids)
- **Anchor Link** (VABS org events) → `scripts/sync-anchorlink.mjs` → exact
  calendar events (`al_*` event ids), no authentication needed

Both write into the same data files:

- `public/data/posts.json` — the Instagram feed shown on the site
- `public/data/events.json` — the events calendar

Post images are downloaded into `public/images/insta/` so the site never
depends on Instagram's image links (those expire after a few days).

Key safety property of both scripts: **if anything goes wrong (a blocked
request, an expired token, a network hiccup), the script changes nothing.**
The site keeps showing the last good data. A failed sync can never delete
posts or events. Manually-curated events (ids not starting with `ig_` or
`al_`) are never touched — see the
[id rules in the Officer Guide](OFFICER_GUIDE.md#the-id-rules-important).

---

## The Anchor Link source

`scripts/sync-anchorlink.mjs` reads the public ICS calendar feed for the VABS
organization:

```
https://anchorlink.vanderbilt.edu/organization/vabs/events.ics
```

- **No secret or token is required** — the feed is public.
- Synced events get ids starting with `al_` and carry exact date, time,
  location, and an `eventUrl` linking back to the Anchor Link event page.
- Anchor Link details are treated as authoritative when the same event is
  also detected from an Instagram caption.
- If the feed URL ever changes (e.g. the org's Anchor Link slug changes),
  set an `ANCHORLINK_ICS_URL` repository secret (**Settings → Secrets and
  variables → Actions**) with the new URL — the script uses it instead of
  the built-in default. No code change needed.

Local run:

```bash
pnpm sync:anchorlink
```

---

## The three ways the Instagram script can talk to Instagram

The script tries these in order, using whichever is configured:

| Mode | What it needs | Reliability | Maintenance |
| --- | --- | --- | --- |
| 1. Instagram Graph API | `IG_ACCESS_TOKEN` secret | Excellent | Token expires every 60 days |
| 2. Behold.so feed | `BEHOLD_FEED_URL` secret | Excellent | None (free tier is enough) |
| 3. Public endpoint | Nothing | Poor from GitHub's servers — Instagram usually blocks it | None |

With **no secrets configured**, the script falls back to mode 3. That works
fine when run from a personal laptop (`pnpm sync:instagram`), but Instagram
usually blocks requests coming from GitHub's servers, so the **scheduled
Instagram sync will quietly do nothing until mode 1 or mode 2 is set up.**
(The Anchor Link sync is unaffected — it needs no setup.)

---

## RECOMMENDED setup: Instagram Graph API (step by step)

This is the official, supported way. It takes about 15–30 minutes once.

### Step 1 — Make the VABS Instagram a Professional account

1. Open the Instagram app, logged in as `vandy.bengalis`.
2. Go to **Settings → Account type and tools → Switch to professional
   account**.
3. Choose **Business** (or Creator — either works). This is free and does
   not visibly change the account.

### Step 2 — Create a Meta app

1. Go to <https://developers.facebook.com/> and log in with a Facebook
   account that an officer controls (consider a shared club account so this
   doesn't break when someone graduates).
2. Click **My Apps → Create App**.
3. Pick the use case **"Manage everything on your Page"** or simply
   **Other → Business**, name it something like `VABS Website Sync`.
4. In the app dashboard, add the product **"Instagram"** → **"API setup
   with Instagram login"** (this is the *Instagram API with Instagram
   Login* — no Facebook Page needed).

### Step 3 — Get a long-lived access token

1. In the app's **Instagram → API setup with Instagram login** screen,
   under **Generate access tokens**, add the `vandy.bengalis` account and
   click **Generate token**. Log in as the club account and approve.
2. Copy the token it shows you. This is a **long-lived token — it works for
   60 days.**

### Step 4 — Add the token to GitHub

1. Open the website repo on GitHub → **Settings** tab → **Secrets and
   variables** → **Actions**.
2. Click **New repository secret**.
3. Name: `IG_ACCESS_TOKEN` (exactly that). Value: paste the token. Save.

Done. The next scheduled run (or a manual run from the Actions tab) will
pull real posts.

> Optional: if you instead use the *Facebook-Page-linked* flavor of the API,
> also add an `IG_BUSINESS_ID` secret with the Instagram Business Account ID,
> and the script will use "business discovery" via graph.facebook.com.
> Most people should skip this.

### ⚠️ The 60-day token expiry (important!)

The token dies after 60 days. Two ways to handle it:

- **Calendar reminder (simple):** set a recurring reminder every ~50 days to
  refresh the token. Refreshing is one request — visiting this URL (with the
  current, still-valid token) returns a fresh 60-day token:

  ```
  https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=PASTE_CURRENT_TOKEN
  ```

  Copy the new `access_token` from the response and update the
  `IG_ACCESS_TOKEN` secret on GitHub (same place as Step 4).

- **Or avoid tokens entirely** with the Behold alternative below — zero
  maintenance, recommended if nobody wants to babysit a token.

If the token expires and nobody notices, nothing breaks — the site just
stops getting new Instagram posts until the token is refreshed (and the
Anchor Link sync keeps the calendar current regardless).

---

## Alternative setup: Behold.so (no token maintenance, easiest long-term)

[Behold](https://behold.so) is a small service that connects to your
Instagram once and gives you a permanent JSON feed URL. Its free tier covers
our needs.

1. Sign up at <https://behold.so> (use a shared club email).
2. Connect the `vandy.bengalis` Instagram account when prompted.
3. Create a **JSON feed** and copy the feed URL it gives you (looks like
   `https://feeds.behold.so/AbCdEf123...`).
4. In the GitHub repo: **Settings → Secrets and variables → Actions → New
   repository secret**, name `BEHOLD_FEED_URL`, value = the feed URL.

Behold keeps the Instagram connection alive itself — no 60-day token dance.

---

## Running the sync

**From the GitHub UI:** Actions tab → select the sync workflow → **Run
workflow** (step-by-step with screenshots-level detail in the
[Officer Guide](OFFICER_GUIDE.md#how-the-site-stays-up-to-date)). If new
data is found, the workflow commits it and chains the deploy workflow
(`workflow_call` — commits made with `GITHUB_TOKEN` don't trigger `push:`
workflows on their own).

**Locally:**

```bash
pnpm sync:instagram                          # real run — updates JSON + images
node scripts/sync-instagram.mjs --dry-run    # preview only, writes nothing
pnpm sync:anchorlink                         # Anchor Link events
```

Local Instagram runs use the public endpoint and usually work from a home
network. Commit and push the changed files afterward to update the site.

---

## Troubleshooting

- **Feed hasn't updated in days** → check the Actions tab for the latest
  sync run and read its log. The scripts print exactly why they stopped
  (e.g. token expired → refresh it, see above).
- **A wrong auto-event appeared** → `ig_*` events come from caption parsing,
  which is best-effort. Either fix the wording in the next caption, or pin a
  corrected manual copy — see the
  [Officer Guide](OFFICER_GUIDE.md#adding-or-fixing-an-event-by-hand).
  (Prefer creating events on Anchor Link: `al_*` events carry exact details.)
- **The script "succeeded" but says it fetched 0 posts** → that's the public
  endpoint being blocked (expected from GitHub's servers). Set up the Graph
  API token or Behold (above).
- **Anchor Link events stopped appearing** → check that
  <https://anchorlink.vanderbilt.edu/organization/vabs/events.ics> still
  loads in a browser; if the org's URL changed, set the `ANCHORLINK_ICS_URL`
  secret (see "The Anchor Link source" above).
