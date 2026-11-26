// Regenerates src/lib/catalog.json, the snapshot of the public catalog the site is built from.
//
//   pnpm catalog <path to a clean more-than-code/skill-forge checkout>
//
// The build never fetches anything: it reads only the committed snapshot, so a deploy is
// reproducible from its commit. The snapshot records the skill-forge commit it came from.
// Refresh it from the commit you want published (normally skill-forge main).
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalog, frontmatterDescription } from './catalog-lib.mjs';

const root = process.argv[2];
if (!root) {
	console.error('usage: pnpm catalog <path to a skill-forge checkout>');
	process.exit(2);
}
const repo = resolve(root);
const git = (/** @type {string[]} */ ...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();

if (git('status', '--porcelain') !== '') {
	console.error(`catalog: ${repo} has uncommitted changes; use a clean checkout`);
	process.exit(1);
}

/** @param {string} dir @returns {string[]} */
function listFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		return entry.isDirectory() ? listFiles(path) : [path];
	});
}

const registry = JSON.parse(readFileSync(join(repo, 'registry.json'), 'utf8'));
const catalog = buildCatalog(registry, (skill) => {
	const dir = join(repo, skill.path);
	return {
		description: frontmatterDescription(readFileSync(join(dir, 'SKILL.md'), 'utf8')),
		files: listFiles(dir).map((file) => relative(dir, file)).sort()
	};
});

const snapshot = {
	source: {
		repo: 'more-than-code/skill-forge',
		commit: git('rev-parse', 'HEAD'),
		committedAt: git('log', '-1', '--format=%cI')
	},
	...catalog
};

const out = fileURLToPath(new URL('../src/lib/catalog.json', import.meta.url));
writeFileSync(out, JSON.stringify(snapshot, null, '\t') + '\n');
console.log(`catalog: ${catalog.skills.length} skills from ${snapshot.source.commit}`);
