# [vabsvu.github.io](https://vabsvu.github.io)

The official website for the Vanderbilt University Association of Bengali
Students — an auto-updating events calendar and Instagram feed.

> **Club officers:** you don't need any of the below. See
> **[docs/OFFICER_GUIDE.md](docs/OFFICER_GUIDE.md)** — post on Instagram or
> create an Anchor Link event, and the site updates itself.

## Quick start

Built with React 18, TypeScript, Vite, and Tailwind CSS. Uses
[pnpm](https://pnpm.io):

```bash
pnpm install
pnpm dev        # Start Vite dev server
pnpm build      # Production build (outputs to dist/)
```

## How deploys work

Every push to `main` builds and publishes the site to GitHub Pages via
[GitHub Actions](.github/workflows/deploy.yml); content syncs
([Instagram + Anchor Link](docs/INSTAGRAM_SYNC.md)) run twice daily and
redeploy automatically when they find changes.

## Contributing

Architecture, conventions, and gotchas are documented in
[CLAUDE.md](CLAUDE.md).
