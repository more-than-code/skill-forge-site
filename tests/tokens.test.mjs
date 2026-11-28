// The design tokens (src/lib/tokens): tokens.css is generated from tokens.json, and every declared
// contrast pair passes WCAG 2.2 in light and dark (ui-design-tokens skill, "Verify").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const dir = new URL('../src/lib/tokens/', import.meta.url);
const script = new URL('scripts/tokens.mjs', dir).pathname;

test('tokens.css matches the generator output', () => {
	const generated = execFileSync(process.execPath, [script, 'css'], { encoding: 'utf8' });
	assert.equal(readFileSync(new URL('tokens.css', dir), 'utf8'), generated);
});

test('every contrast pair passes WCAG in both modes', () => {
	const run = spawnSync(process.execPath, [script, 'check', '--json'], { encoding: 'utf8' });
	assert.equal(run.status, 0, run.stdout + run.stderr);
});
