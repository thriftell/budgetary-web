# Disclosure gate — the `/how-it-works` depth (0020b)

> **DO NOT publish the gated pages until counsel sign-off.**
> The "Details / how-it-works" depth is the most disclosure-sensitive surface on the site. The
> engine is private and pre-filing-sensitive (provisional not filed until **2026-07-31**). Drafting
> is not disclosure; **publishing is.** Until counsel signs off, these pages must not be emitted,
> indexed, or linked in production.

## What is gated

| Path | Gated | Source |
| --- | --- | --- |
| `/how-it-works` | ✅ | `src/components/howitworks/HowItWorks.astro` via `src/pages/[...slug].astro` |

The single source of truth is `src/config.ts` → `GATED_PATHS` and the `SHOW_DETAILS` flag.

## How the gate works (default: closed)

With `SHOW_DETAILS` unset or `false` (the default, and what CI/production build with):

1. **Not emitted.** `src/pages/[...slug].astro`'s `getStaticPaths()` returns `[]`, so the gated
   pages are never written to `dist/`. There is nothing to fetch by URL — zero public exposure.
2. **Not in the sitemap.** `astro.config.mjs` filters `GATED_PATHS` out of `sitemap-index.xml`.
3. **Disallowed in `robots.txt`.** `src/pages/robots.txt.ts` adds `Disallow: /how-it-works` and
   `Disallow: /docs/` while the gate is closed.
4. **Not linked.** The hero and footer "How it works" links only render when `SHOW_DETAILS` is on.
5. **`noindex` on the page itself.** Even when emitted, the gated page carries
   `<meta name="robots" content="noindex, nofollow">`.

The grep gate (`scripts/check-forbidden-phrases.mjs`) runs over the source regardless of the flag,
so the copy is checked for banned engine vocabulary even while the pages are unpublished.

## Two-step go-live (after counsel sign-off)

Publishing is irreversible and pre-filing-sensitive. Both steps are **committed code changes that go
through a reviewed PR** — deliberately not an out-of-band repo/environment-variable toggle, so the
publish action cannot be flipped without code review.

1. **Expose + link + sitemap + crawlable.** In `.github/workflows/deploy.yml`, change the build
   step's env from `SHOW_DETAILS: "false"` to `SHOW_DETAILS: "true"`. On the next deploy to `main`
   the pages emit, the links appear, the sitemap includes them, and `robots.txt` stops disallowing
   them. (Locally: `SHOW_DETAILS=true npm run build`.)
2. **Allow indexing.** In `src/pages/[...slug].astro`, change the gated render from `noindex={true}`
   to `noindex={false}` (one clearly-marked line) so search engines may index the page.

Doing step 1 without step 2 puts the page live but `noindex` — a deliberate, conservative default
for the most sensitive page. Reverting is the same two switches in reverse.

**Belt-and-suspenders:** protect the `github-pages` deploy environment with a required-reviewers
rule in repo settings, so even a merged flag-flip needs a second human approval before it deploys.

## Verifying the gate locally

```bash
npm run build                       # default: gated pages absent from dist/
test ! -e dist/how-it-works/index.html && echo "gate closed ✓"

SHOW_DETAILS=true npm run build     # gated pages present, still noindex
grep -q 'noindex' dist/how-it-works/index.html && echo "noindex present ✓"
```
