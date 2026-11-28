// Regenerates src/lib/catalog.json, the snapshot of the public catalog the site is built from.
//
//   pnpm catalog <path to a clean more-than-code/skill-forge checkout>
//
// The build never fetches anything: it reads only the committed snapshot, so a deploy is
// reproducible from its commit. The snapshot records the skill-forge commit it came from.
// Refresh it from the commit you want published (normally skill-forge main).
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalog, frontmatterDescription, SHOWCASE_PATTERNS } from './catalog-lib.mjs';

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

// Showcase images are copied next to the pages; the folder is rebuilt so removed showcases go too.
const imagesOut = fileURLToPath(new URL('../static/showcase/', import.meta.url));
rmSync(imagesOut, { recursive: true, force: true });

/** showcase/<name>/showcase.json from the checkout, if tracked; buildCatalog checks its content. */
function readShowcase(/** @type {string} */ name) {
	const rel = `showcase/${name}/showcase.json`;
	if (!existsSync(join(repo, rel)) || git('ls-files', '--', rel) !== rel) return null;
	return JSON.parse(readFileSync(join(repo, rel), 'utf8'));
}

const registry = JSON.parse(readFileSync(join(repo, 'registry.json'), 'utf8'));
const catalog = buildCatalog(registry, (skill) => {
	// buildCatalog has already checked skill.path against inventory/skills/<name>. Only tracked files
	// are listed, so nothing git-ignored in the checkout can reach the public snapshot.
	const files = git('ls-files', '-z', '--', skill.path)
		.split('\0')
		.filter(Boolean)
		.map((file) => file.slice(skill.path.length + 1))
		.sort();
	return {
		description: frontmatterDescription(readFileSync(join(repo, skill.path, 'SKILL.md'), 'utf8')),
		files,
		showcase: readShowcase(skill.name)
	};
});

for (const skill of catalog.skills) {
	for (const item of skill.showcase?.inAction ?? []) {
		if (item.kind !== 'image' || !SHOWCASE_PATTERNS.IMAGE_FILE.test(item.file)) continue;
		const rel = `showcase/${skill.name}/${item.file}`;
		if (git('ls-files', '--', rel) !== rel) throw new Error(`catalog: ${rel} is not a tracked file`);
		mkdirSync(join(imagesOut, skill.name), { recursive: true });
		copyFileSync(join(repo, rel), join(imagesOut, skill.name, item.file));
	}
}

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
