# budgetary-web

Website for **budgetary.tools** — pre-flight token-spend estimates for AI coding agents, or an
honest "no read". Never a confident guess.

This is the top-of-funnel landing page: an honest hero, a one-command install, and per-platform
copy-paste prompts. The "Details / how it works" depth lives behind `/how-it-works` (shipped
separately).

## Stack

- [Astro](https://astro.build), static output. No CMS, no runtime backend.
- Deployed to GitHub Pages on every push to `main` (see [DEPLOY.md](./DEPLOY.md)).

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # static build into dist/ (runs the honesty gate)
npm run check:copy    # run the forbidden-phrase gate on its own
npm run check:install # run the /signup key-substitution gate on its own
```

## The honesty gate

The copy is the product, and its differentiator is intellectual honesty. `scripts/check-forbidden-phrases.mjs`
fails the build if any cardinal-sin marketing phrase (e.g. claiming accurate/guaranteed spend
prediction) or any private engine-internals term appears in the copy. It runs automatically as
`prebuild` (over `src/`) and `postbuild` (over the rendered `dist/`). Do not weaken these rules to
ship copy — fix the copy.

## Install / prompt strings

Every install command and prompt lives in [`src/data/install.ts`](./src/data/install.ts), each traced
to a source (the `budgetary-clients` repo docs and the MCP registry entry
`io.github.thriftell/budgetary`). Strings that source does not yet pin carry a `TODO(verify)` note and
are surfaced on the page. Never invent a command.

`HERO_INSTALL` carries one extra contract: the literal `bg_test_YOUR_KEY` must appear in it **exactly
once**, because [`src/pages/signup.astro`](./src/pages/signup.astro) does
`heroInstall.replace("bg_test_YOUR_KEY", key)` to hand a new signup their real key. Break that literal
and the substitution silently no-ops — the page still renders, and every new user is handed a
placeholder. `scripts/check-hero-placeholder.mjs` fails the build if it does, and also if the hero
command ever reverts to the estimate-only hosted remote (that path has no local process, so nothing
estimated through it is ever closed out by an actual). It runs as `prebuild` and `postbuild`.
