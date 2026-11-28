<script lang="ts">
	import type { Skill } from './catalog';
	import GroupIcon from './GroupIcon.svelte';
	import { skillGroup, skillLine } from './groups.js';

	// One row per skill: the group's icon, the name, the version and one short line. The full
	// description is on the skill's own page.
	let { skills, icons = true }: { skills: Skill[]; icons?: boolean } = $props();
</script>

<ul class="skills" role="list">
	{#each skills as skill (skill.name)}
		{@const group = skillGroup(skill.name)}
		<li>
			{#if icons && group}<span class="icon" title={group.title}><GroupIcon id={group.id} size={18} /></span>{/if}
			<div class="text">
				<a class="name" href="/skills/{skill.name}">{skill.name}</a>
				<span class="muted version">{skill.version}</span>
				<p>{skillLine(skill.name)}</p>
			</div>
		</li>
	{/each}
</ul>

<style>
	.skills {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		column-gap: var(--space-5);
	}

	li {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
		padding: var(--space-3) 0;
		border-top: 1px solid var(--line);
		min-width: 0;
	}

	.icon {
		display: inline-flex;
		margin-top: 3px; /* off-scale: aligns the icon with the name's first line */
		color: var(--ink-2);
	}

	.text {
		min-width: 0;
	}

	.name {
		font-weight: var(--fw-bold);
		overflow-wrap: anywhere;
	}

	.version {
		margin-left: var(--space-2);
		font-size: var(--fs-sm);
	}

	p {
		margin: var(--space-1) 0 0;
		color: var(--ink-2);
		font-size: var(--fs-sm);
	}
</style>
