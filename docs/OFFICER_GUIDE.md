# VABS Officer Guide

Welcome! You don't need to know how to code to keep
[vabsvu.github.io](https://vabsvu.github.io) up to date. The short version:

> **Post on Instagram, or create an Anchor Link event — the website updates
> itself.**

This guide explains how that works and what (little) you need to do.

---

## How the site stays up to date

```
  You post on Instagram            You create an Anchor Link event
  (@vandy.bengalis)                (anchorlink.vanderbilt.edu/organization/vabs)
        │                                   │
        └────────────┬──────────────────────┘
                     ▼
        Automatic sync, twice a day (5am & 5pm UTC)
                     ▼
        Calendar + Instagram feed on the website
        update on their own — no code, no buttons
```

Twice a day, an automated job reads our Instagram and our Anchor Link events
feed, updates the site's data, and redeploys the website. If anything goes
wrong (Instagram is down, a token expired), **nothing breaks** — the site
just keeps showing the last good data until the next successful sync.

**Want it updated right now?** Don't wait for the schedule:

1. Open the repo on GitHub → **Actions** tab.
2. Click the sync workflow in the left sidebar.
3. Click **Run workflow** → green **Run workflow** button.
4. A few minutes later the live site is updated.

---

## Posting tips so events are auto-detected

**Anchor Link is the most accurate source.** Events created on
[Anchor Link](https://anchorlink.vanderbilt.edu/organization/vabs) sync to the
calendar with their exact date, time, and location automatically — nothing to
remember. If you only do one thing, create your events there.

**Instagram captions are read by a robot**, so help it out. In your event
posts, include:

- a **date** — "Friday, April 17"
- a **time** — "6-8pm"
- a **location** on its own line — "📍 SLC Ballroom"

A caption like this gets picked up perfectly:

> Mock Shaadi is BACK! 🎉
> Friday, April 17 · 6-8pm
> 📍 SLC Ballroom
> Wear your best fits!

If an Instagram post and an Anchor Link event describe the same event, the
calendar shows it once (Anchor Link details win — they're exact).

---

## Adding or fixing an event by hand

Sometimes you want to add an event that isn't posted anywhere yet, or fix a
detail the robot got wrong. Edit one file, right in your browser:

1. Open the repo on GitHub and navigate to `public/data/events.json`.
2. Click the **pencil icon** (Edit this file).
3. Add or edit an event (see below), then click **Commit changes**.
4. The site redeploys automatically — done in a few minutes.

### The id rules (important)

- Ids starting with **`ig_`** (Instagram) or **`al_`** (Anchor Link) are
  **machine-managed** — the sync rewrites them on every run, so your edits to
  those entries will be overwritten.
- To pin an event permanently, give it **your own id**, like
  `evt_2026_formal`. Manual ids are never touched by the sync.
- To *fix* a machine-made event: copy it, change the id to your own, edit the
  details, and keep its `instagramPermalink`/`eventUrl` (or at least the same
  `date` + `title`) so the sync knows your version covers it and doesn't
  re-add a duplicate.

### Field reference

| Field | Required | Format / meaning |
| --- | --- | --- |
| `id` | yes | Unique string. Use `evt_YYYY_short_name`. Must NOT start with `ig_` or `al_`. |
| `title` | yes | Event name shown on the calendar. |
| `date` | yes | `YYYY-MM-DD` |
| `startTime` | no | 24-hour `HH:MM`, e.g. `"19:00"` for 7 PM. |
| `endTime` | no | 24-hour `HH:MM`. |
| `location` | no | Free text, e.g. `"Rand Hall"`. |
| `description` | no | A sentence or two. |
| `category` | yes | One of: `flagship`, `social`, `cultural`, `meeting`, `food`, `other`. |
| `imageUrl` | no | Path under `public/`, e.g. `"/images/insta/mshaadi.webp"`, or `null`. |
| `thumbUrl` | no | Small thumbnail image (machine-filled for synced events). |
| `instagramPermalink` | no | Link to the related Instagram post, or `null`. |
| `eventUrl` | no | Link to the event page (e.g. its Anchor Link page), or `null`. |

### Example

Add an object like this inside the `"events": [ ... ]` list (don't forget the
comma between events):

```json
{
  "id": "evt_2026_chai_chat",
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

> Tip: GitHub's editor highlights JSON mistakes — a missing comma is the
> usual culprit.

---

## Next steps checklist for a new officer

1. **Get added to the `vabsvu` GitHub organization.** Ask the previous
   webmaster or any current org owner to invite your GitHub account.
2. **One-time, if not already done:** ask an org admin to set
   **Settings → Pages → Source → "GitHub Actions"** on this repo. (Without
   this, GitHub tries to serve the raw source code instead of the built
   website.)
3. **Optional but recommended:** set up the Instagram access token so the
   Instagram sync works reliably — about 15 minutes, and the token lasts 60
   days, so **set a recurring reminder to refresh it**. Full walkthrough:
   [INSTAGRAM_SYNC.md](INSTAGRAM_SYNC.md). (Anchor Link sync needs no setup
   at all — it just works.)
4. **Stuck?** Open an issue on the repo's **Issues** tab describing what's
   wrong — whoever maintains the site will see it. Screenshots help!

---

*Technical details about how the sync works under the hood live in
[INSTAGRAM_SYNC.md](INSTAGRAM_SYNC.md). Developer setup is in the
[README](../README.md).*
