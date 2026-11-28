// Catalog groups (src/lib/groups.js): every skill in the snapshot is placed in a group with a short
// visitor line, and every entry points at a real group.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GROUPS, SKILL_GROUPS, groupSkills } from '../src/lib/groups.js';

const catalog = JSON.parse(readFileSync(new URL('../src/lib/catalog.json', import.meta.url), 'utf8'));

test('every catalog skill has a group and a one-line summary', () => {
	const missing = catalog.skills.map((s) => s.name).filter((name) => !SKILL_GROUPS[name]);
	assert.deepEqual(missing, [], 'add these skills to SKILL_GROUPS in src/lib/groups.js');
});

test('every entry names a known group and a short line', () => {
	const ids = new Set(GROUPS.map((g) => g.id));
	for (const [name, { group, line }] of Object.entries(SKILL_GROUPS)) {
		assert.ok(ids.has(group), `${name}: unknown group ${group}`);
		assert.ok(line.length > 0 && line.length <= 90, `${name}: line must be 1 to 90 characters`);
	}
});

test('grouping keeps every skill exactly once', () => {
	const grouped = groupSkills(catalog.skills).flatMap((entry) => entry.skills.map((s) => s.name));
	assert.equal(grouped.length, catalog.skills.length);
	assert.equal(new Set(grouped).size, catalog.skills.length);
});
