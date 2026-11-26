import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Local preview does not apply _headers; only Cloudflare Pages does.
export default defineConfig({
	plugins: [sveltekit()],
	server: { host: '127.0.0.1', port: 5200, strictPort: true },
	preview: { host: '127.0.0.1', port: 5200, strictPort: true }
});
