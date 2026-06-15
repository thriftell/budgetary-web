# Deploy

This site is a static Astro build (`npm run build` → `dist/`) deployed to **GitHub Pages** via
`.github/workflows/deploy.yml` on every push to `main`. The build runs the forbidden-phrase honesty
gate (`scripts/check-forbidden-phrases.mjs`) as `prebuild` (over `src/`) and `postbuild` (over the
rendered `dist/`); any hit fails the deploy.

## Custom domain (budgetary.tools, apex + www) with auto-HTTPS

`public/CNAME` pins the custom domain to `budgetary.tools`, so it is emitted into `dist/` on every
build. In the repo settings enable **Settings → Pages → Source: GitHub Actions**, and under **Custom
domain** confirm `budgetary.tools` and tick **Enforce HTTPS** (GitHub provisions the Let's Encrypt
cert automatically once DNS resolves).

Create these DNS records at the `budgetary.tools` registrar — the four `A` records point the apex at
GitHub Pages, the `AAAA` records cover IPv6, and the `www` `CNAME` lets `www.budgetary.tools` redirect
to the apex:

| Type  | Host  | Value                                   |
| ----- | ----- | --------------------------------------- |
| A     | `@`   | `185.199.108.153`                       |
| A     | `@`   | `185.199.109.153`                       |
| A     | `@`   | `185.199.110.153`                       |
| A     | `@`   | `185.199.111.153`                       |
| AAAA  | `@`   | `2606:50c0:8000::153`                   |
| AAAA  | `@`   | `2606:50c0:8001::153`                   |
| AAAA  | `@`   | `2606:50c0:8002::153`                   |
| AAAA  | `@`   | `2606:50c0:8003::153`                   |
| CNAME | `www` | `thriftell.github.io.`                  |

> Cloudflare Pages is an equally valid host (free, auto-HTTPS): point it at this repo with build
> command `npm run build` and output dir `dist`, then add `budgetary.tools` + `www` as custom domains
> — Cloudflare manages the apex/CNAME and certs for you. If you switch to Cloudflare, delete
> `public/CNAME` so it doesn't fight Cloudflare's domain config.
