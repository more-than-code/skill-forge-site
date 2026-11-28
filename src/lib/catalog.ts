// The public catalog snapshot (src/lib/catalog.json, regenerated with `pnpm catalog`) and the
// figures the site shows. Every number here is computed from the snapshot; nothing is live.
import data from './catalog.json';

export type Skill = (typeof data.skills)[number];

export const catalog = data;

export function findSkill(name: string): Skill | undefined {
	return data.skills.find((skill) => skill.name === name);
}

/** Tags with how many skills carry each, most used first, then by name. */
export function tagCounts(): { tag: string; count: number }[] {
	const counts = new Map<string, number>();
	for (const skill of data.skills) for (const tag of skill.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	return [...counts]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));
}

export function skillsWithTag(tag: string): Skill[] {
	return data.skills.filter((skill) => skill.tags.includes(tag));
}

/** The snapshot's date as "25 November 2026" (UTC, so the build does not depend on its machine's zone). */
export function snapshotDate(): string {
	return new Date(data.source.committedAt).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
}

/** A skill's showcase as scripts/catalog-lib.mjs checkShowcase writes it (JSON import types lose the union). */
export type ShowcaseItem = { caption: string; source: string } & (
	| { kind: 'image'; file: string; alt: string }
	| { kind: 'excerpt'; excerpt: string }
	| { kind: 'swatches'; swatches: { name: string; hex: string }[] }
);

export type Showcase = {
	value: string;
	howItWorks: { title: string; stages: { name: string; lines: string[]; accent: boolean }[] };
	workflow: string[];
	inAction: ShowcaseItem[];
};

export function showcaseOf(skill: Skill): Showcase | null {
	return (skill.showcase as Showcase | null) ?? null;
}
