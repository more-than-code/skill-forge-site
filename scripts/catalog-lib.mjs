// Pure helpers for scripts/catalog.mjs, kept separate so tests can import them without a checkout.

const NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;
const VERSION = /^\d+\.\d+\.\d+$/;

/**
 * The `description` from a SKILL.md YAML frontmatter block. Handles the forms the registry uses:
 * plain, quoted, and folded (`>`) or literal (`|`) block scalars. Whitespace is collapsed, because
 * the site shows it as one paragraph.
 * @param {string} text
 * @returns {string}
 */
export function frontmatterDescription(text) {
	const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
	if (!match) return '';
	const lines = match[1].split(/\r?\n/);
	const start = lines.findIndex((line) => /^description:/.test(line));
	if (start === -1) return '';
	let value = lines[start].slice('description:'.length).trim();
	if (/^[>|][+-]?$/.test(value)) {
		const block = [];
		for (const line of lines.slice(start + 1)) {
			if (line.trim() !== '' && !/^\s/.test(line)) break;
			block.push(line.trim());
		}
		value = block.join(' ');
	} else if (/^(['"]).*\1$/.test(value)) {
		value = value.slice(1, -1);
	}
	return value.replace(/\s+/g, ' ').trim();
}

/**
 * The public catalog the site is built from: installable skills with what a visitor needs, plus
 * counts of the other artifact kinds. Throws on names, versions or tags the site could not
 * show safely, so a bad registry fails the snapshot instead of the page.
 * @param {any} registry parsed registry.json
 * @param {(skill: any) => { description: string, files: string[] }} readSkill
 */
export function buildCatalog(registry, readSkill) {
	const skills = registry.skills
		.filter((skill) => skill.type === 'skill' && skill.installable !== false)
		.map((skill) => {
			if (!NAME.test(skill.name)) throw new Error(`bad skill name: ${skill.name}`);
			if (!VERSION.test(skill.version)) throw new Error(`bad version for ${skill.name}: ${skill.version}`);
			const tags = skill.tags ?? [];
			for (const tag of tags) if (!NAME.test(tag)) throw new Error(`bad tag on ${skill.name}: ${tag}`);
			const { description, files } = readSkill(skill);
			return { name: skill.name, version: skill.version, tags, description, path: skill.path, files };
		})
		.sort((a, b) => a.name.localeCompare(b.name));
	return {
		registryVersion: registry.version,
		skills,
		counts: {
			skills: skills.length,
			subagentSets: (registry.managedSubagents ?? []).length,
			hookSets: (registry.managedHooks ?? []).length,
			instructionVariants: (registry.instructionVariants ?? []).length
		}
	};
}
