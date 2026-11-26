// Addresses for the public site, a static site on Cloudflare Pages, separate from the portal.
// The domains are placeholders until Joe picks them: scripts/deploy.sh refuses a production
// deploy while any ".example" host is in the build.

/** The site's origin. Canonical, og:url, sitemap and robots URLs use it on every host. */
export const SITE_URL = 'https://skillforge.example';

/** The portal's sign-in page (the SvelteKit portal, a different host). Shown only with PORTAL_LIVE=1. */
export const SIGN_IN_URL = 'https://portal.skillforge.example/signin';

/** The open-source registry and skf CLI: the public catalog's source. */
export const REPO_URL = 'https://github.com/more-than-code/skill-forge';

/** A file or folder in the public registry at the snapshot's commit, so links match what the page shows. */
export const sourceUrl = (commit: string, path: string) =>
	`${REPO_URL}/tree/${commit}/${path.split('/').map(encodeURIComponent).join('/')}`;
