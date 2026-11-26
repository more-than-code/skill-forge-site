// Checks the built site in build/ (run `pnpm build` first). Every rule is about what visitors get.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';

const build = new URL('../build/', import.meta.url).pathname;
const snapshot = JSON.parse(readFileSync(new URL('../src/lib/catalog.json', import.meta.url), 'utf8'));

/** @param {string} dir @returns {string[]} */
const walk = (dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));

assert.ok(existsSync(build), 'build/ is missing: run pnpm build first');
const files = walk(build).map((f) => relative(build, f));
const text = files.filter((f) => /\.(html|css|txt|xml|svg)$/.test(f) || f === '_headers');
const read = (f) => readFileSync(join(build, f), 'utf8');

// The site's own hosts (placeholders until the domains are chosen), the public registry on GitHub,
// and XML namespaces.
const ALLOWED_URL = [
	/^https:\/\/skillforge\.example(\/|$)/,
	/^https:\/\/portal\.skillforge\.example\//,
	/^https:\/\/github\.com\/more-than-code\/skill-forge(\/|$)/,
	/^http:\/\/www\.w3\.org\/2000\/svg$/,
	/^http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9$/
];

test('no JavaScript ships', () => {
	assert.deepEqual(files.filter((f) => f.endsWith('.js')), []);
	for (const f of text) assert.doesNotMatch(read(f), /<script/i, f);
});

test('every absolute URL is on an allowed host', () => {
	for (const f of text) {
		if (f === '_headers') continue;
		for (const [url] of read(f).matchAll(/https?:\/\/[^\s"'<>)`]+/g)) {
			assert.ok(ALLOWED_URL.some((re) => re.test(url)), `${f}: ${url}`);
		}
	}
});

test('every skill and tag has a page, and the sitemap lists them', () => {
	const sitemap = read('sitemap.xml');
	const tags = new Set(snapshot.skills.flatMap((s) => s.tags));
	for (const s of snapshot.skills) {
		assert.ok(files.includes(`skills/${s.name}.html`), s.name);
		assert.ok(sitemap.includes(`/skills/${s.name}</loc>`), `sitemap: ${s.name}`);
	}
	for (const t of tags) {
		assert.ok(files.includes(`tags/${t}.html`), t);
		assert.ok(sitemap.includes(`/tags/${t}</loc>`), `sitemap: ${t}`);
	}
});

test('Pages files: 404 page, headers, robots, llms.txt and no redirects', () => {
	assert.ok(files.includes('404.html'));
	assert.match(read('404.html'), /href="\/_app\//, '404.html uses absolute asset URLs');
	assert.ok(!files.includes('_redirects'));
	assert.match(read('_headers'), /X-Content-Type-Options: nosniff/);
	assert.match(read('robots.txt'), /^Sitemap: https:\/\/[^\s]+\/sitemap\.xml$/m);
	assert.match(read('llms.txt'), /^# Skill Forge\n/);
});

test('no page has a robots meta (noindex comes from _headers on preview hosts only)', () => {
	for (const f of text.filter((f) => f.endsWith('.html'))) assert.doesNotMatch(read(f), /name="robots"/, f);
});

test('Sign in appears only when the portal is live', () => {
	const home = read('index.html');
	if (process.env.PORTAL_LIVE === '1') assert.match(home, /\/signin"/);
	else for (const f of text) assert.doesNotMatch(read(f), /\/signin/, f);
});
