import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Plain HTML and CSS in build/: every route prerendered, no SPA fallback.
		adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
		// Absolute /_app/... asset URLs, so build/404.html works at any depth (Pages serves it for /a/b/c).
		paths: { relative: false },
		prerender: {
			// /404 is linked from nowhere; list it so it is emitted as build/404.html.
			entries: ['*', '/404']
		}
	}
};

export default config;
