// Addresses for the public site, a static site on Cloudflare Pages, separate from the console.
// The site lives at the root domain, skillforgecloud.com (www redirects to it), and the console at
// console.skillforgecloud.com.

/** The site's origin: the root domain. Canonical, og:url, sitemap and robots URLs use it on every host,
 * so www and pages.dev copies never become canonical. */
export const SITE_URL = 'https://skillforgecloud.com';

/** The console's sign-in page (the SvelteKit console, a different host). Shown only with CONSOLE_LIVE=1. */
export const SIGN_IN_URL = 'https://console.skillforgecloud.com/signin';

/** The open-source registry and skf CLI: the public catalog's source. */
export const REPO_URL = 'https://github.com/more-than-code/skill-forge';

/** A file or folder in the public registry at the snapshot's commit, so links match what the page shows. */
export const sourceUrl = (commit: string, path: string) =>
	`${REPO_URL}/tree/${commit}/${path.split('/').map(encodeURIComponent).join('/')}`;
