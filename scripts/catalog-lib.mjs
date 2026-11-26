// Pure helpers for scripts/catalog.mjs, kept separate so tests can import them without a checkout.

const NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;
const VERSION = /^\d+\.\d+\.\d+$/;
const SKILL_PATH = /^inventory\/skills\/[a-z0-9][a-z0-9-]{0,63}$/;
// A file path inside a skill folder: plain segments, no dot-only segments, nothing a URL would read specially.
const FILE_PATH = /^(?!.*(^|\/)\.\.?(\/|$))[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/;

export const PATTERNS = { NAME, VERSION, SKILL_PATH, FILE_PATH };

/**
 * The `description` from a SKILL.md YAML frontmatter block. Handles the forms the registry uses:
 * plain (with continuation lines), single-line quoted, and folded (`>`) or literal (`|`) block
 * scalars. Forms it cannot read correctly throw rather than publish a mangled description. Whitespace is collapsed, because
 * the site shows it as one paragraph.
 * @param {string} text
 * @returns {string}
 */
export function frontmatterDescription(text) {
	const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---[ \t]*(\r?\n|$)/.exec(text);
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
	} else if (/^['"]/.test(value)) {
		// Single-line quoted scalars only; '' is YAML's escaped single quote.
		const quote = value[0];
		if (value.length < 2 || !value.endsWith(quote)) throw new Error('description: multi-line or unclosed quoted scalar is not supported');
		value = value.slice(1, -1);
		if (quote === "'") value = value.replaceAll("''", "'");
		else if (value.includes('\\')) throw new Error('description: escapes in double-quoted scalars are not supported');
	} else {
		// A plain scalar may continue on more-indented lines.
		for (const line of lines.slice(start + 1)) {
			if (!/^\s+\S/.test(line)) break;
			value += ' ' + line.trim();
		}
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
			if (!SKILL_PATH.test(skill.path)) throw new Error(`bad path for ${skill.name}: ${skill.path}`);
			const tags = skill.tags ?? [];
			for (const tag of tags) if (!NAME.test(tag)) throw new Error(`bad tag on ${skill.name}: ${tag}`);
			const { description, files } = readSkill(skill);
			if (!description) throw new Error(`no description in ${skill.name}/SKILL.md`);
			for (const file of files) if (!FILE_PATH.test(file)) throw new Error(`bad file in ${skill.name}: ${file}`);
			return { name: skill.name, version: skill.version, tags, description, path: skill.path, files };
		})
		.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
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
