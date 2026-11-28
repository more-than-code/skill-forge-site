// Regenerates src/lib/catalog.json, the snapshot of the public catalog the site is built from.
//
//   pnpm catalog <path to a clean more-than-code/skill-forge checkout>
//
// The build never fetches anything: it reads only the committed snapshot, so a deploy is
// reproducible from its commit. The snapshot records the skill-forge commit it came from.
// Refresh it from the commit you want published (normally skill-forge main).
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalog, checkImage, frontmatterDescription, trackedBlob } from './catalog-lib.mjs';

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

/** showcase/<name>/showcase.json at HEAD, if committed as a regular file; buildCatalog checks its content. */
function readShowcase(/** @type {string} */ name) {
	const bytes = trackedBlob(repo, `showcase/${name}/showcase.json`);
	return bytes === null ? null : JSON.parse(bytes.toString('utf8'));
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

// Showcase images come from the commit, never through a link in the worktree. They are written to a
// fresh folder that replaces static/showcase/ only once every image has passed, so a failed refresh
// leaves the committed images and catalog.json as they were.
const imagesOut = fileURLToPath(new URL('../static/showcase/', import.meta.url));
const staging = mkdtempSync(join(tmpdir(), 'showcase-'));
try {
	for (const skill of catalog.skills) {
		for (const item of skill.showcase?.inAction ?? []) {
			if (item.kind !== 'image') continue;
			const rel = `showcase/${skill.name}/${item.file}`;
			const bytes = trackedBlob(repo, rel);
			if (bytes === null) throw new Error(`catalog: ${rel} is not a committed regular file`);
			checkImage(bytes, rel);
			mkdirSync(join(staging, skill.name), { recursive: true });
			writeFileSync(join(staging, skill.name, item.file), bytes);
		}
	}
	rmSync(imagesOut, { recursive: true, force: true });
	cpSync(staging, imagesOut, { recursive: true });
} finally {
	rmSync(staging, { recursive: true, force: true });
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
