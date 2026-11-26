import { catalog } from '$lib/catalog';
import { REPO_URL, SITE_URL } from '$lib/links';

export const prerender = true;

export function GET() {
	const skills = catalog.skills
		.map((skill) => `- [${skill.name}](${SITE_URL}/skills/${skill.name}) ${skill.version}: ${skill.description}`)
		.join('\n');
	const body = `# Skill Forge

> A git registry of versioned skills, instructions and subagents for coding agents. Repositories
> declare skills and version ranges in skill-forge.json; \`skf sync\` vendors exact copies with a
> SHA-256 lockfile.

- Source and CLI (MIT): ${REPO_URL}
- Catalog snapshot: commit ${catalog.source.commit} of ${catalog.source.repo}, registry ${catalog.registryVersion}

## Skills

${skills}
`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
