# [vabsvu.github.io](https://vabsvu.github.io)

The official website for the Vanderbilt University Association of Bengali Students!

Built with React 18, TypeScript, Vite, and Tailwind CSS.

## Development

Uses [pnpm](https://pnpm.io):

```bash
pnpm dev        # Start Vite dev server
pnpm build      # Production build (outputs to dist/)
pnpm preview    # Preview production build
pnpm lint       # ESLint
```

## Deployment

Pushing to `main` triggers the [Deploy to GitHub Pages](.github/workflows/deploy.yml)
workflow, which builds the site with Vite and publishes `dist/` to GitHub Pages
via Actions. It can also be run manually from the Actions tab.

Instagram feed data is synced automatically — see [docs/INSTAGRAM_SYNC.md](docs/INSTAGRAM_SYNC.md).
