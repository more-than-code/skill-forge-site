import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { readdirSync } from 'node:fs';
import { PATTERNS, SHOWCASE_PATTERNS, buildCatalog, checkShowcase, frontmatterDescription } from '../scripts/catalog-lib.mjs';

test('frontmatterDescription reads plain, quoted and block descriptions', () => {
	assert.equal(frontmatterDescription('---\nname: a\ndescription: Plain text.\n---\nbody'), 'Plain text.');
	assert.equal(frontmatterDescription('---\ndescription: "Quoted: yes"\n---\n'), 'Quoted: yes');
	assert.equal(
		frontmatterDescription('---\nname: a\ndescription: >\n  Folded over\n  two lines.\nother: x\n---\n'),
		'Folded over two lines.'
	);
	assert.equal(frontmatterDescription('---\ndescription: |\n  Literal\n  block\n---\n'), 'Literal block');
	assert.equal(frontmatterDescription('---\r\ndescription: CRLF works\r\n---\r\n'), 'CRLF works');
	assert.equal(frontmatterDescription('\uFEFF---\ndescription: BOM\n---\n'), 'BOM');
	assert.equal(frontmatterDescription("---\ndescription: 'It''s'\n---\n"), "It's");
	assert.equal(frontmatterDescription('---\ndescription: Plain that\n  continues.\nname: a\n---\n'), 'Plain that continues.');
	assert.equal(frontmatterDescription('---\ndescription: x\n---extra\n'), '', 'closing fence must be a whole line');
	assert.throws(() => frontmatterDescription('---\ndescription: "unclosed\n  more"\n---\n'), /unclosed/);
	assert.throws(() => frontmatterDescription('---\ndescription: "a \\" b"\n---\n'), /escapes/);
	assert.equal(frontmatterDescription('no frontmatter'), '');
	assert.equal(frontmatterDescription('---\nname: a\n---\n'), '');
});

const read = () => ({ description: 'd', files: ['SKILL.md'] });
const registry = (skills) => ({ version: '1.0.0', skills, managedSubagents: [{}], managedHooks: [], instructionVariants: [{}, {}] });
const skill = (over = {}) => ({ type: 'skill', name: 'b-skill', version: '0.1.0', path: 'inventory/skills/b', tags: ['x'], ...over });

test('buildCatalog keeps installable skills, sorted, with counts', () => {
	const catalog = buildCatalog(
		registry([skill(), skill({ name: 'a-skill' }), skill({ name: 'hidden', installable: false }), { type: 'hooks', name: 'h' }]),
		read
	);
	assert.deepEqual(catalog.skills.map((s) => s.name), ['a-skill', 'b-skill']);
	assert.deepEqual(catalog.counts, { skills: 2, subagentSets: 1, hookSets: 0, instructionVariants: 2 });
});

test('buildCatalog refuses names, versions and tags it cannot show safely', () => {
	assert.throws(() => buildCatalog(registry([skill({ name: '<b>' })]), read), /bad skill name/);
	assert.throws(() => buildCatalog(registry([skill({ version: '1.0' })]), read), /bad version/);
	assert.throws(() => buildCatalog(registry([skill({ tags: ['../x'] })]), read), /bad tag/);
	assert.throws(() => buildCatalog(registry([skill({ path: 'inventory/skills/../../etc' })]), read), /bad path/);
	assert.throws(() => buildCatalog(registry([skill({ path: '/etc' })]), read), /bad path/);
	assert.throws(() => buildCatalog(registry([skill()]), () => ({ description: '', files: ['SKILL.md'] })), /no description/);
	for (const file of ['../x', 'a/../b', 'a#b', 'a?b', 'a%2e', '.']) {
		assert.throws(() => buildCatalog(registry([skill()]), () => ({ description: 'd', files: [file] })), /bad file/, file);
	}
});

test('the committed snapshot is well formed', () => {
	const snapshot = JSON.parse(readFileSync(new URL('../src/lib/catalog.json', import.meta.url), 'utf8'));
	assert.equal(snapshot.source.repo, 'more-than-code/skill-forge');
	assert.match(snapshot.source.commit, /^[0-9a-f]{40}$/);
	assert.ok(!Number.isNaN(Date.parse(snapshot.source.committedAt)));
	assert.equal(snapshot.counts.skills, snapshot.skills.length);
	assert.ok(snapshot.skills.length > 0);
	for (const s of snapshot.skills) {
		assert.ok(s.description, `${s.name} has a description`);
		assert.ok(s.files.includes('SKILL.md'), `${s.name} lists SKILL.md`);
		// A hand-edited snapshot gets the same checks as a generated one: these values reach
		// sitemap.xml, llms.txt and URLs unescaped.
		assert.match(s.name, PATTERNS.NAME);
		assert.match(s.version, PATTERNS.VERSION);
		assert.match(s.path, PATTERNS.SKILL_PATH);
		for (const tag of s.tags) assert.match(tag, PATTERNS.NAME);
		for (const file of s.files) assert.match(file, PATTERNS.FILE_PATH);
		for (const item of s.showcase?.inAction ?? []) {
			assert.ok(['image', 'excerpt', 'swatches'].includes(item.kind), `${s.name}: item kind`);
			if (item.kind === 'image') assert.match(item.file, SHOWCASE_PATTERNS.IMAGE_FILE);
			for (const swatch of item.swatches ?? []) assert.match(swatch.hex, SHOWCASE_PATTERNS.HEX);
		}
	}
});

const showcase = () => ({
	value: 'Saves time.',
	howItWorks: { title: 'Two parts', stages: [{ name: 'In', lines: ['a'] }, { name: 'Out', lines: ['b'], accent: true }] },
	workflow: ['One', 'Two'],
	inAction: [
		{ caption: 'c', source: 's', image: { file: 'shot.png', alt: 'a' } },
		{ caption: 'c', source: 's', excerpt: 'x\ny' },
		{ caption: 'c', source: 's', swatches: [{ name: 'brand', hex: '#E96800' }] }
	],
	extra: 'dropped'
});

test('checkShowcase keeps only the shown fields and tags each item with its kind', () => {
	const out = checkShowcase(showcase(), 'x');
	assert.equal('extra' in out, false);
	assert.deepEqual(out.inAction.map((i) => i.kind), ['image', 'excerpt', 'swatches']);
	assert.equal(out.howItWorks.stages[0].accent, false);
	assert.equal(out.inAction[0].file, 'shot.png');
});

test('checkShowcase refuses what the page could not show safely', () => {
	const bad = (edit) => {
		const data = showcase();
		edit(data);
		return () => checkShowcase(data, 'x');
	};
	assert.throws(bad((d) => (d.inAction[0].image.file = '../x.png')), /plain image name/);
	assert.throws(bad((d) => (d.inAction[0].image.file = 'x.svg')), /plain image name/);
	assert.throws(bad((d) => (d.inAction[2].swatches[0].hex = 'red;}')), /#RRGGBB/);
	assert.throws(bad((d) => (d.value = 'a\u0007b')), /printable/);
	assert.throws(bad((d) => (d.inAction[1].image = { file: 'a.png', alt: 'a' })), /exactly one/);
	assert.throws(bad((d) => (d.workflow = ['only one'])), /2 to 6/);
	assert.throws(bad((d) => (d.howItWorks.stages[0].lines = [])), /1 to 4/);
});

test('showcase images in static/ are exactly the ones the snapshot names', () => {
	const snapshot = JSON.parse(readFileSync(new URL('../src/lib/catalog.json', import.meta.url), 'utf8'));
	const named = snapshot.skills.flatMap((s) =>
		(s.showcase?.inAction ?? []).filter((i) => i.kind === 'image').map((i) => `${s.name}/${i.file}`)
	);
	for (const n of named) assert.match(n.split('/')[1], SHOWCASE_PATTERNS.IMAGE_FILE);
	const dir = new URL('../static/showcase/', import.meta.url);
	let present = [];
	try {
		present = readdirSync(dir, { recursive: true, withFileTypes: true })
			.filter((e) => e.isFile())
			.map((e) => `${e.parentPath.split('/').filter(Boolean).at(-1)}/${e.name}`);
	} catch {
		present = [];
	}
	assert.deepEqual(present.sort(), named.sort());
});
