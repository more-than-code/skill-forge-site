import { execFileSync } from 'node:child_process';
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

// CJK scripts (Han, Hiragana, Katakana, Hangul, Bopomofo) and full-width punctuation. The site is in
// English, so it shows none of these, even where a SKILL.md carries inline terms such as "主色 primary".
export const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Bopomofo}\u3000-\u303F\uFF00-\uFFEF]/u;
const CJK_RUN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Bopomofo}\u3000-\u303F\uFF00-\uFFEF]+/gu;

/**
 * A SKILL.md description with its inline CJK terms taken out: a term before its English word
 * ("主色 primary" becomes "primary") or a term in a list before a colon or bracket ('"quiet UI", 安静的页面:'
 * becomes '"quiet UI":'). Throws if any remains, so the snapshot fails rather than the page.
 * @param {string} text
 * @param {string} name the skill, for the message
 */
export function englishOnly(text, name) {
	const out = text
		.replace(new RegExp(`\\s*,\\s*${CJK_RUN.source}\\s*(?=[:)\\]])`, 'gu'), '')
		.replace(new RegExp(`${CJK_RUN.source}\\s+`, 'gu'), '')
		.replace(/\s+/g, ' ')
		.trim();
	if (CJK.test(out)) throw new Error(`description of ${name} still has CJK text after removing inline terms`);
	return out;
}

/**
 * The public catalog the site is built from: installable skills with what a visitor needs, plus
 * counts of the other artifact kinds. Throws on names, versions or tags the site could not
 * show safely, so a bad registry fails the snapshot instead of the page.
 * @param {any} registry parsed registry.json
 * @param {(skill: any) => { description: string, files: string[], showcase?: any }} readSkill
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
			const { description, files, showcase } = readSkill(skill);
			if (!description) throw new Error(`no description in ${skill.name}/SKILL.md`);
			const shown = englishOnly(description, skill.name);
			for (const file of files) if (!FILE_PATH.test(file)) throw new Error(`bad file in ${skill.name}: ${file}`);
			return {
				name: skill.name,
				version: skill.version,
				tags,
				description: shown,
				path: skill.path,
				files,
				showcase: showcase ? checkShowcase(showcase, skill.name) : null
			};
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

// ---- Skill showcases (skill-forge docs/SHOWCASE.md): showcase/<skill>/showcase.json ----

const IMAGE_FILE = /^[a-z0-9][a-z0-9-]{0,63}\.(png|jpg|webp)$/;
const HEX = /^#[0-9A-Fa-f]{6}$/;
// No control, bidi-override or invisible format characters (same rule as skill-forge lib/showcase.js).
const LINE = /^[^\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2066-\u2069\uFEFF]+$/;
const BLOCK = /^[^\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2066-\u2069\uFEFF]+$/;
// Same caps as skill-forge: SVG text does not wrap, so lengths fit the boxes in Showcase.svelte.
export const SHOWCASE_LIMITS = { stageName: 18, stageLine: 26, swatchName: 10, imageBytes: 512 * 1024 };

export const SHOWCASE_PATTERNS = { IMAGE_FILE, HEX };

/** @param {any} value @param {string} where @param {number} max @param {RegExp} [pattern] @returns {string} */
function str(value, where, max, pattern = LINE) {
	if (typeof value !== 'string' || value.trim() === '' || value.length > max || !pattern.test(value)) {
		throw new Error(`showcase: ${where} must be printable text of at most ${max} characters`);
	}
	if (CJK.test(value)) throw new Error(`showcase: ${where} must be in English (the site shows no CJK text)`);
	return value;
}

/** @param {any} value @param {string} where @param {number} min @param {number} max @returns {any[]} */
function arr(value, where, min, max) {
	if (!Array.isArray(value) || value.length < min || value.length > max) {
		throw new Error(`showcase: ${where} must be a list of ${min} to ${max} items`);
	}
	return value;
}

/** @param {any[]} stages @param {string} name */
function oneAccent(stages, name) {
	if (stages.filter((stage) => stage?.accent === true).length > 1) throw new Error(`showcase: ${name} has more than one accent stage`);
	return stages;
}

/**
 * A showcase.json reduced to the fields the site shows, each checked. Throws on anything else,
 * so a bad showcase fails the snapshot instead of the page. Unknown fields are dropped.
 * @param {any} data
 * @param {string} name the skill
 */
export function checkShowcase(data, name) {
	const at = (/** @type {string} */ path) => `${name} ${path}`;
	if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`showcase: ${name} is not an object`);
	const how = data.howItWorks ?? {};
	return {
		value: str(data.value, at('value'), 400),
		howItWorks: {
			title: str(how.title, at('howItWorks.title'), 120),
			stages: oneAccent(arr(how.stages, at('howItWorks.stages'), 2, 4), name).map((stage, i) => ({
				name: str(stage?.name, at(`stages[${i}].name`), SHOWCASE_LIMITS.stageName),
				lines: arr(stage?.lines, at(`stages[${i}].lines`), 1, 4).map((line, j) => str(line, at(`stages[${i}].lines[${j}]`), SHOWCASE_LIMITS.stageLine)),
				accent: stage?.accent === true
			}))
		},
		workflow: arr(data.workflow, at('workflow'), 2, 6).map((step, i) => str(step, at(`workflow[${i}]`), 200)),
		inAction: arr(data.inAction, at('inAction'), 1, 6).map((item, i) => {
			const where = at(`inAction[${i}]`);
			if (!item || typeof item !== 'object') throw new Error(`showcase: ${where} is not an object`);
			const kinds = ['image', 'excerpt', 'swatches'].filter((kind) => item[kind] !== undefined);
			if (kinds.length !== 1) throw new Error(`showcase: ${where} needs exactly one of image, excerpt or swatches`);
			const base = { caption: str(item.caption, `${where}.caption`, 300), source: str(item.source, `${where}.source`, 200) };
			if (item.image !== undefined) {
				const file = item.image?.file;
				if (typeof file !== 'string' || !IMAGE_FILE.test(file)) throw new Error(`showcase: ${where}.image.file is not a plain image name`);
				return { ...base, kind: 'image', file, alt: str(item.image.alt, `${where}.image.alt`, 200) };
			}
			if (item.excerpt !== undefined) return { ...base, kind: 'excerpt', excerpt: str(item.excerpt, `${where}.excerpt`, 1500, BLOCK) };
			return {
				...base,
				kind: 'swatches',
				swatches: arr(item.swatches, `${where}.swatches`, 1, 16).map((swatch, j) => {
					if (typeof swatch?.hex !== 'string' || !HEX.test(swatch.hex)) throw new Error(`showcase: ${where}.swatches[${j}].hex must be #RRGGBB`);
					return { name: str(swatch.name, `${where}.swatches[${j}].name`, SHOWCASE_LIMITS.swatchName), hex: swatch.hex };
				})
			};
		})
	};
}

/**
 * A file's bytes as committed at HEAD, or null when it is not committed as a regular file (missing,
 * a symlink or a submodule). Reading the blob, not the worktree, means no link can pull in a file
 * from outside the checkout.
 * @param {string} repo
 * @param {string} rel
 * @returns {Buffer | null}
 */
export function trackedBlob(repo, rel) {
	const entry = execFileSync('git', ['-C', repo, 'ls-files', '-s', '--', rel], { encoding: 'utf8' }).trim();
	const match = /^(100644|100755) [0-9a-f]+ 0\t(.+)$/.exec(entry);
	if (!match || match[2] !== rel) return null;
	return execFileSync('git', ['-C', repo, 'cat-file', 'blob', `HEAD:${rel}`], { maxBuffer: 16 * 1024 * 1024 });
}

/**
 * Throws unless the bytes are a PNG, JPEG or WebP image matching the file's extension and within the size cap.
 * @param {Buffer} bytes
 * @param {string} rel
 */
export function checkImage(bytes, rel) {
	if (bytes.length > SHOWCASE_LIMITS.imageBytes) throw new Error(`showcase: ${rel} is larger than 512 KB`);
	const ext = rel.slice(rel.lastIndexOf('.') + 1);
	const ok =
		(ext === 'png' && bytes.length > 8 && bytes.readUInt32BE(0) === 0x89504e47 && bytes.readUInt32BE(4) === 0x0d0a1a0a) ||
		(ext === 'jpg' && bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
		(ext === 'webp' && bytes.length > 12 && bytes.toString('latin1', 0, 4) === 'RIFF' && bytes.toString('latin1', 8, 12) === 'WEBP');
	if (!ok) throw new Error(`showcase: ${rel} is not a ${ext} image`);
}
