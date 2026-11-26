# Skill Forge site

The public landing site, at the root domain (`<domain>`, with `www.<domain>` redirecting to it): the home page, the public skill catalog (`/skills`, one page per skill
and per tag), a 404 page, `robots.txt`, `sitemap.xml` and `llms.txt`. Visitors browse without
signing in; using the platform means signing in to the console, a separate app at `console.<domain>`.
The site is static, on Cloudflare Pages (project `skill-forge-site`), with its own build and
release, the same way the Deploybot and Defect Drainer sites are built and hosted.

## How it is built

- SvelteKit 2 with `@sveltejs/adapter-static` (`strict: true`). `src/routes/+layout.js` sets
  `prerender = true`, `csr = false` and `trailingSlash = 'never'`, so every page is HTML written at
  build time and the browser runs no JavaScript. `scripts/postbuild.mjs` deletes the `.js`,
  `__data.json` and `version.json` files SvelteKit still emits.
- `kit.paths.relative = false`, so `404.html` loads its CSS at any depth. Pages serves `404.html`
  with status 404 for every unknown path.
- Colours: tokens in `src/app.css` from the brand mark (`static/favicon.svg`, copied from
  skill-forge `docs/brand/logo/mark.svg`). Dark mode follows the system; there is no theme switch.
- Addresses are in `src/lib/links.ts`. The domains are placeholders (`skillforge.example`) until
  they are chosen; `deploy.sh` refuses a production deploy while the build names them.

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
cd site
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

## Deploy (on Joe's yes)

Direct upload with the pinned Wrangler in `package.json`. No Git integration: Pages never gets
access to this private repo, and nothing deploys by itself. CI (`.github/workflows/site.yml`) runs
the gates and never deploys.

| What | Where |
|---|---|
| API token (secret, Cloudflare Pages edit only) | `~/.config/skill-forge/cloudflare-pages-token`, mode 600, read only by `deploy.sh`, never printed |
| Account id (not secret) | `CLOUDFLARE_ACCOUNT_ID`, or `~/.config/skill-forge/cloudflare-account-id` |

```bash
sh scripts/deploy.sh                               # preview: https://preview.skill-forge-site.pages.dev
BRANCH=main CONSOLE_LIVE=0 sh scripts/deploy.sh     # production, after Joe's yes
DRY_RUN=1 sh scripts/deploy.sh                     # every gate, no upload, reads no credentials
```

`deploy.sh` refuses a dirty tree; for production it also refuses a commit that is not on
`origin/dev`, placeholder domains still in `src/lib/links.ts`, and an unset `CONSOLE_LIVE`, before any gate. It runs
install, check, test, build and guard, checks the tree and HEAD did not change, then runs
`wrangler pages deploy build --project-name skill-forge-site --branch <branch> --commit-hash <HEAD>`.
The project's production branch is `main`; any other branch is a preview.

## Domains (after the domain is chosen)

The site is the root domain; the console is `console.<domain>` (Joe, 2026-11-26).

1. Set `SITE_URL` (`https://<domain>`) and `SIGN_IN_URL` (`https://console.<domain>/signin`) in
   `src/lib/links.ts`, and the allowed hosts in `tests/guard.build.mjs`.
2. In the Pages project, add `<domain>` and `www.<domain>` as custom domains.
3. Redirect `www.<domain>` to `https://<domain>` (301, path and query kept) with a Cloudflare
   redirect rule on the zone. Pages' `_redirects` matches paths only, not hosts, and the build has
   no `_redirects`. Canonical URLs already name the root domain, so `www` is never indexed as a
   separate site.
4. `console.<domain>` points at the console's host (Deploybot), not at Pages.

`_headers` adds `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, a strict Content-Security-Policy and a Permissions-Policy everywhere,
and `X-Robots-Tag: noindex` on `pages.dev` hosts and a direct `/404`, so previews are never indexed.
