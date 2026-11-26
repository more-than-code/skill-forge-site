import { catalog, tagCounts } from '$lib/catalog';
import { SITE_URL } from '$lib/links';

export const prerender = true;

export function GET() {
	const paths = [
		'',
		'/skills',
		...catalog.skills.map((skill) => `/skills/${skill.name}`),
		...tagCounts().map(({ tag }) => `/tags/${tag}`)
	];
	const urls = paths.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join('\n');
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
