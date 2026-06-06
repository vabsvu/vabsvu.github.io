# Instagram Sync — How the Website Stays Up to Date

The VABS website automatically pulls the latest posts from our Instagram
([@vandy.bengalis](https://www.instagram.com/vandy.bengalis/)) twice a day.
It updates the **Instagram feed** on the site and tries to detect **events**
from post captions (dates, times, locations) to fill in the events calendar.

No one needs to touch code for this to work — but this document explains how
it works, how to set up (or fix) the connection to Instagram, and how to add
events by hand.

---

## How it works (the big picture)

```
  ┌─────────────┐   twice daily    ┌──────────────────────────┐
  │   GitHub     │  (5am & 5pm UTC) │  sync script              │
  │   schedule   │ ───────────────▶ │  scripts/sync-instagram   │
  └─────────────┘                  │  • fetches latest 12 posts │
                                   │  • downloads the images    │
                                   │  • detects events in       │
                                   │    captions                │
                                   └────────────┬─────────────┘
                                                │ only if something
                                                │ actually changed
                                   ┌────────────▼─────────────┐
                                   │  commit to the repo       │
                                   │  (posts.json, events.json,│
                                   │   images)                 │
                                   └────────────┬─────────────┘
                                                │
                                   ┌────────────▼─────────────┐
                                   │  website rebuild + deploy │
                                   │  → vabsvu.github.io       │
                                   └──────────────────────────┘
```

Key safety property: **if anything goes wrong (Instagram blocks the request,
a token expired, the internet hiccups), the script changes nothing.** The
site keeps showing the last good data. A failed sync can never delete posts
or events.

The data lives in two files anyone can read:

- `public/data/posts.json` — the Instagram feed shown on the site
- `public/data/events.json` — the events calendar

Post images are downloaded into `public/images/insta/` so the site never
depends on Instagram's image links (those expire after a few days).

---

## The three ways the script can talk to Instagram

The script tries these in order, using whichever is configured:

| Mode | What it needs | Reliability | Maintenance |
| --- | --- | --- | --- |
| 1. Instagram Graph API | `IG_ACCESS_TOKEN` secret | Excellent | Token expires every 60 days |
| 2. Behold.so feed | `BEHOLD_FEED_URL` secret | Excellent | None (free tier is enough) |
| 3. Public endpoint | Nothing | Poor from GitHub's servers — Instagram usually blocks it | None |

Right now, with **no secrets configured**, the script falls back to mode 3.
That works fine when run from a personal laptop (`pnpm sync:instagram`), but
Instagram usually blocks requests coming from GitHub's servers, so the
**scheduled sync will quietly do nothing until mode 1 or mode 2 is set up.**
Set one of them up — instructions below.

---

## RECOMMENDED setup: Instagram Graph API (step by step)

This is the official, supported way. It takes about 30 minutes once.

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

Done. The next scheduled run (or a manual run, see below) will pull real
posts.

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
stops getting new posts until the token is refreshed.

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

## Triggering a sync manually

You don't have to wait for the schedule:

1. Open the repo on GitHub → **Actions** tab.
2. In the left sidebar, click **"Sync Instagram"**.
3. Click the **"Run workflow"** dropdown (right side) → green **Run
   workflow** button.
4. Wait a minute or two. If new data was found, a deploy starts
   automatically and the live site updates a few minutes later.

Developers can also run it locally from the repo:

```bash
pnpm sync:instagram             # real run — updates the JSON + images
node scripts/sync-instagram.mjs --dry-run   # preview only, writes nothing
```

(Local runs use the public endpoint and usually work from a home network.
Commit and push the changed files afterward to update the site.)

---

## Adding or editing events by hand

The automatic event detection is best-effort — captions are messy! You can
(and should) curate `public/data/events.json` directly. Anything you add
manually is **never touched** by the sync, as long as its `id` does **not**
start with `ig_` (those are the auto-generated ones, which get refreshed on
every sync).

### Field reference

| Field | Required | Format / meaning |
| --- | --- | --- |
| `id` | yes | Unique string. Use `evt_YYYYMMDD_short_name`. Must NOT start with `ig_`. |
| `title` | yes | Event name shown on the calendar. |
| `date` | yes | `YYYY-MM-DD` |
| `startTime` | no | 24-hour `HH:MM`, e.g. `"19:00"` for 7 PM. |
| `endTime` | no | 24-hour `HH:MM`. |
| `location` | no | Free text, e.g. `"Rand Hall"`. |
| `description` | no | A sentence or two. |
| `category` | yes | One of: `flagship`, `social`, `cultural`, `meeting`, `food`, `other`. |
| `imageUrl` | no | Path under `public/`, e.g. `"/images/insta/mshaadi.webp"`, or `null`. |
| `instagramPermalink` | no | Link to the related Instagram post, or `null`. |

### Example

Add an object like this inside the `"events": [ ... ]` list (don't forget
the comma between events):

```json
{
  "id": "evt_20261105_chai_chat",
  "title": "Chai & Chat GBM",
  "date": "2026-11-05",
  "startTime": "18:30",
  "endTime": "20:00",
  "location": "Multicultural Community Space",
  "description": "Monthly general body meeting with free chai and snacks!",
  "category": "meeting",
  "imageUrl": null,
  "instagramPermalink": null
}
```

Easiest way to edit without any tools: open the file on GitHub
(`public/data/events.json`) → pencil icon → edit → **Commit changes** to
`main`. The site redeploys automatically on every push to `main`.

> Tip: after editing, make sure the file is still valid JSON (GitHub's
> editor highlights mistakes; a missing comma is the usual culprit).

---

## Troubleshooting

- **Feed hasn't updated in days** → check the Actions tab for the latest
  "Sync Instagram" run and read its log. The script prints exactly why it
  stopped (e.g. token expired → refresh it, see above).
- **A wrong auto-event appeared** → auto-events come from caption parsing.
  Either fix the wording in the next Instagram caption, or copy the event
  into a manual entry (change its `id` so it doesn't start with `ig_`) and
  it will stick. **Keep the event's `instagramPermalink`** (or at least its
  `date` and `title`) when copying — the sync uses those to recognize that
  your manual entry covers the post and to suppress the duplicate
  auto-event on future runs.
- **The script "succeeded" but says it fetched 0 posts** → that's the public
  endpoint being blocked (expected from GitHub's servers). Set up the Graph
  API token or Behold (above).
