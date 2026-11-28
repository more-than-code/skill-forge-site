# Skill Forge site

The public landing site, at the root domain (`skillforgecloud.com`, with `www.skillforgecloud.com` redirecting to it): the home page, the public skill catalog (`/skills`, one page per skill
and per tag), a 404 page, `robots.txt`, `sitemap.xml` and `llms.txt`. Visitors browse without
signing in; using the platform means signing in to the console, a separate app at `console.skillforgecloud.com`.
The site is static, on Cloudflare Pages (project `skill-forge-site`), built from this public repo,
which releases at its own pace, apart from the private platform repo (API and console).
Pull requests go into `dev`.

## How it is built

- SvelteKit 2 with `@sveltejs/adapter-static` (`strict: true`). `src/routes/+layout.js` sets
  `prerender = true`, `csr = false` and `trailingSlash = 'never'`, so every page is HTML written at
  build time and the browser runs no JavaScript. `scripts/postbuild.mjs` deletes the `.js`,
  `__data.json` and `version.json` files SvelteKit still emits.
- `kit.paths.relative = false`, so `404.html` loads its CSS at any depth. Pages serves `404.html`
  with status 404 for every unknown path.
- Design tokens: `src/lib/tokens/tokens.json` is the source of truth (the `ui-design-tokens` skill's
  structure and role names). Colour values are derived with the `brand-palette-roles` skill from the
  brand mark (`static/favicon.svg`, copied from skill-forge `docs/brand/logo/mark.svg`; primary
  `#F97316`, secondary `#1E293B`). `src/lib/tokens/tokens.css` is generated; never edit it by hand.
  After changing `tokens.json`, from `src/lib/tokens/`: `node scripts/tokens.mjs css > tokens.css`, then
  `node scripts/tokens.mjs check` (0 WCAG failures required; APCA lines are advisory). `src/app.css` and
  the components use tokens only. Dark mode follows the system through `light-dark()`; there is no theme
  switch (the site ships no JavaScript).
- Addresses are in `src/lib/links.ts`: the site at `https://skillforgecloud.com`, sign-in at
  `https://console.skillforgecloud.com/signin`.

## The catalog snapshot

The build never fetches anything. It reads `src/lib/catalog.json`, a committed snapshot of the
public registry (`more-than-code/skill-forge`): installable skills with version, tags, the
`description` from each `SKILL.md`, and file list, plus counts and the source commit and date.
Every number on the site is computed from it; there are no live usage or evaluation figures yet.

Refresh it from a clean skill-forge checkout at the commit you want published (normally `main`):

```bash
pnpm catalog ../path/to/skill-forge
```

The script refuses a dirty checkout and rejects names, versions or tags outside the registry's
patterns. Skill and file links point at the snapshot's commit, so they always match the page.

## Gate flags

Build-time environment variables, `0` (default) or `1`; anything else fails the build. A gated
claim is absent from the output while its flag is off, so the site says only what is live.

| Flag | Turns on | Set to 1 when |
|---|---|---|
| `CONSOLE_LIVE` | Sign in (header), Get started, the "Your own registries" section | the console accepts sign-ins |

## Commands

```bash
pnpm install --frozen-lockfile
pnpm check   # svelte-check, warnings fail
pnpm test    # catalog parser and validation, and the committed snapshot
pnpm build   # vite build + postbuild prune -> build/
pnpm guard   # tests/guard.build.mjs over build/
```

`pnpm dev` and `pnpm preview` use `127.0.0.1:5200`. Local preview does not apply `_headers`.

`guard` checks: no `.js` file or `<script>`; every absolute URL is on the site's hosts or under
`github.com/more-than-code/skill-forge`; a page and a sitemap entry for every skill and tag; `404.html`
with absolute asset URLs; `_headers`, `robots.txt` and `llms.txt` present and no `_redirects`; no
robots meta; no inline styles (the CSP in `_headers` allows only `style-src 'self'`); every sitemap URL is a built page and `llms.txt` lists every skill; Sign in and the registries section only with `CONSOLE_LIVE=1`, pointing at the console. CI runs build and guard with the flag off and on.

## Deploy

Cloudflare Pages builds this public repo through its Git integration: a push to `main` deploys
production, a push to `dev` deploys a preview. Nobody holds a deploy token. CI
(`.github/workflows/ci.yml`, GitHub-hosted runners) runs the `light` gates on pull requests and the `full` gates on pushes to `dev` and `main`, and never deploys;
Pages runs the build and the guard too, so a build that fails the guard is never published.

Pages project settings (set by the maintainer in the Cloudflare dashboard):

| Setting | Value |
|---|---|
| Project | `skill-forge-site`, connected to `more-than-code/skill-forge-site` |
| Production branch | `main` |
| Preview branches | custom: include `dev` only (pull requests and other branches are not built) |
| Build command | `pnpm build && pnpm guard` (Pages runs `pnpm install` first, detected from `pnpm-lock.yaml`) |
| Build output directory | `build` |
| Root directory | `/` |
| Environment variables (production and preview) | `CONSOLE_LIVE=0`, `PNPM_VERSION=10.28.0`, `NODE_VERSION=22` |

The variables are flags and tool versions only: never put a secret in them, since every build of this public repo can read them. `.node-version` also pins Node 22. Set `CONSOLE_LIVE=1` in the production variables, then
redeploy, only once the console accepts sign-ins.

## Release path

| Branch | How it moves | Required (GitHub ruleset) |
|---|---|---|
| `dev` | pull requests only | the `light` check: install, check, test, build and guard |
| `main` | fast-forward from `dev`, no merge commits | the `full` check on that commit, from its push to `dev`: `light` plus build and guard with `CONSOLE_LIVE=1` |

Both branches block force pushes and deletion. A push to `main` deploys production.

## Domains

The site is the root domain, `skillforgecloud.com`; the console is `console.skillforgecloud.com`.

1. `src/lib/links.ts` holds `SITE_URL` and `SIGN_IN_URL`; `tests/guard.build.mjs` allows only these hosts.
2. The Pages project has `skillforgecloud.com` and `www.skillforgecloud.com` as custom domains.
3. `www.skillforgecloud.com` redirects to `https://skillforgecloud.com` (301, path and query kept) with a Cloudflare
   redirect rule on the zone. Pages' `_redirects` matches paths only, not hosts, and the build has
   no `_redirects`. Canonical URLs already name the root domain, so `www` is never indexed as a
   separate site.
4. `console.skillforgecloud.com` (later) points at the console's host (Deploybot), not at Pages.

`_headers` adds `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, a strict Content-Security-Policy and a Permissions-Policy everywhere,
and `X-Robots-Tag: noindex` on `pages.dev` hosts and a direct `/404`, so previews are never indexed.
