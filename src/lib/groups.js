// Catalog groups: what a skill is for, so visitors can scan the catalog by purpose instead of reading
// 40-odd descriptions. Each skill also gets a one-line summary written for visitors; the registry's
// `description` is written for agents (when to activate the skill) and stays in full on the skill page.
// Every skill in src/lib/catalog.json must have an entry here: tests/groups.test.mjs fails otherwise,
// so a catalog refresh that adds a skill also places it. Entries for skills not in the snapshot are ignored.

/** @typedef {{ id: string, title: string, blurb: string }} Group */

/** @type {Group[]} In display order. `id` also names the group's icon in GroupIcon.svelte. */
export const GROUPS = [
	{ id: 'review', title: 'Code quality and review', blurb: 'Guardrails while coding and the checks a review runs.' },
	{ id: 'security', title: 'Security and safe changes', blurb: 'Secrets, contracts, migrations and audit trails.' },
	{ id: 'testing', title: 'Testing and defects', blurb: 'Test plans, coverage and the defect workflow.' },
	{ id: 'design', title: 'Design and frontend', blurb: 'Tokens, style rules, palettes, landing pages and UI code.' },
	{ id: 'ops', title: 'Release and operations', blurb: 'Deploys, production readiness, containers and machines.' },
	{ id: 'setup', title: 'Agent setup', blurb: 'Skill Forge, Claude Projects and agent tool configuration.' },
	{ id: 'roles', title: 'Roles and teamwork', blurb: 'Several agent sessions, or an agent and a worker, sharing one product.' },
	{ id: 'stack', title: 'Stack-specific', blurb: 'Rules for one platform, SDK or service.' }
];

/** @type {Record<string, { group: string, line: string }>} */
export const SKILL_GROUPS = {
	'code-quality': { group: 'review', line: 'Review design, clarity, naming, duplication and error handling.' },
	'coding-discipline': { group: 'review', line: 'Guardrails against overengineering, hidden assumptions and drive-by edits.' },
	'review-checklist': { group: 'review', line: 'The checks every code review runs before it approves a change.' },
	'performance-analysis': { group: 'review', line: 'Find performance bottlenecks and plan the fixes.' },

	'security-baseline': { group: 'security', line: 'Security checks for every code change, at every risk tier.' },
	'api-contracts': { group: 'security', line: 'Version public APIs and keep them backward compatible.' },
	'migration-deprecation': { group: 'security', line: 'Migrate versions and retire contracts without breaking consumers.' },
	'data-migration': { group: 'security', line: 'Plan schema changes, data format changes and backfills.' },
	'audit-trail': { group: 'security', line: 'Integrity checks, correction logs and change provenance.' },

	'testing-strategy': { group: 'testing', line: 'Check test coverage, test quality and edge cases.' },
	'defect-drainer-intake': { group: 'testing', line: 'File machine-found issues as defects, with evidence, for a human to judge.' },
	'defect-drainer-test-plans': { group: 'testing', line: 'Keep a test plan in Defect Drainer and get it run, with screenshots.' },
	'defect-drainer-workflow': { group: 'testing', line: 'Claim, fix and resolve Defect Drainer items from a coding session.' },

	'ui-design-tokens': { group: 'design', line: 'Every token value for a web UI, with light, dark and a contrast check.' },
	'quiet-ui-style-guide': { group: 'design', line: 'Usage rules for a calm, dense work-tool interface.' },
	'brand-palette-roles': { group: 'design', line: 'Turn a brand\'s few colours into a full, readable palette.' },
	'landing-page': { group: 'design', line: 'Build a product site that leads with value and only claims what ships.' },
	'ui-portability-baseline': { group: 'design', line: 'Keep UI code portable across repos, themes and host containers.' },
	'frontend-engineering': { group: 'design', line: 'Review frontend architecture, state, accessibility and styling.' },
	'design-sync-flutter': { group: 'design', line: 'Sync a Flutter design system to Claude Design.' },
	'design-sync-svelte': { group: 'design', line: 'Sync a Svelte design system to Claude Design.' },
	'product-parity': { group: 'design', line: 'Check that a ported client matches its source, screen by screen.' },

	'deployment-strategy': { group: 'ops', line: 'Choose blue-green, canary, rolling or feature-flag releases.' },
	'production-readiness': { group: 'ops', line: 'Check observability and infrastructure before production.' },
	'failure-analysis': { group: 'ops', line: 'Find failure modes and risky partial rollouts before they happen.' },
	'vercel-deploy': { group: 'ops', line: 'Deploy a Node app with the Vercel CLI.' },
	'podman-utilization': { group: 'ops', line: 'Container workflows that also work where Podman replaces Docker.' },
	'disk-cleanup': { group: 'ops', line: 'Free disk space on a developer Mac safely.' },

	'claude-project-steward': { group: 'setup', line: 'Set up and repair how Claude Project threads get skills and rules.' },
	'local-to-cloud-migration': { group: 'setup', line: 'Move local Claude Code work into cloud sessions, then retire it.' },
	'skill-forge-project': { group: 'setup', line: 'Pick the right registry skills for a repository and apply them.' },
	'skill-forge-authoring': { group: 'setup', line: 'Write and version skills in the Skill Forge registry.' },
	'aws-toolkit-skills': { group: 'setup', line: 'Fetch an AWS Agent Toolkit skill into a project when a task needs it.' },
	'codex-config-toml': { group: 'setup', line: 'Edit the Codex CLI configuration file safely.' },

	'session-roles': { group: 'roles', line: 'How several role sessions share one product and hand work over.' },
	'role-main-dev': { group: 'roles', line: 'The session that owns specs, code, tests and merges.' },
	'role-slice-dev': { group: 'roles', line: 'The session that builds one slice in its own worktree.' },
	'role-ops': { group: 'roles', line: 'The session that releases and runs hosts and environments.' },
	'role-product-design': { group: 'roles', line: 'The session for research, positioning, copy and UI design.' },
	'role-end-user': { group: 'roles', line: 'The session that uses the product like a real user and reports issues.' },
	'umbrella-workspace': { group: 'roles', line: 'Cooperation rules for multi-repo workspaces and parallel sessions.' },
	'external-worker-delegation': { group: 'roles', line: 'Let another agent CLI do the work while yours reviews it.' },
	'grok-build-harness': { group: 'roles', line: 'Delegate a build to the Grok Build CLI and read its results.' },

	'audio-webkit-cleanup': { group: 'stack', line: 'Keep browser audio alive on iOS and WebKit.' },
	'fvm-flutter': { group: 'stack', line: 'Use FVM as the only way to run a pinned Flutter SDK.' },
	'supabase-postgres': { group: 'stack', line: 'Use Supabase as plain Postgres from an app with its own sessions.' },
	'llm-integration': { group: 'stack', line: 'Validation and safe defaults for LLM calls in automated workflows.' },
	'llm-json-portable': { group: 'stack', line: 'Get reliable JSON from any OpenAI-compatible model.' },
	'ica-llm-gateway': { group: 'stack', line: 'Point a project or agent CLI at the IBM Consulting Advantage gateway.' }
};

/**
 * Group a list of skills for display, in GROUPS order, skipping empty groups.
 * @template {{ name: string }} S
 * @param {S[]} skills
 * @returns {{ group: Group, skills: S[] }[]}
 */
export function groupSkills(skills) {
	return GROUPS.map((group) => ({
		group,
		skills: skills.filter((skill) => SKILL_GROUPS[skill.name]?.group === group.id)
	})).filter((entry) => entry.skills.length > 0);
}

/** The visitor-facing one-liner for a skill. @param {string} name */
export function skillLine(name) {
	return SKILL_GROUPS[name]?.line ?? '';
}

/** The group a skill belongs to. @param {string} name @returns {Group | undefined} */
export function skillGroup(name) {
	const id = SKILL_GROUPS[name]?.group;
	return GROUPS.find((group) => group.id === id);
}
