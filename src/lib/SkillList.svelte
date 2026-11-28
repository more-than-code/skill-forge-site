<script lang="ts">
	import type { Skill } from './catalog';

	let { skills }: { skills: Skill[] } = $props();
</script>

<ul class="skills panel" role="list">
	{#each skills as skill (skill.name)}
		<li>
			<a class="name" href="/skills/{skill.name}">{skill.name}</a>
			<span class="muted version">{skill.version}</span>
			<p>{skill.description}</p>
		</li>
	{/each}
</ul>

<style>
	.skills {
		list-style: none;
		padding: 0 var(--space-4);
		margin: 0;
	}

	li {
		padding: var(--space-3) 0;
	}

	li + li {
		border-top: 1px solid var(--line);
	}

	.name {
		font-weight: var(--fw-bold);
		font-size: var(--fs-lg);
		display: inline-block;
		min-height: 28px;
	}

	.version {
		margin-left: var(--space-2);
		font-size: var(--fs-sm);
	}

	p {
		margin: var(--space-1) 0 0;
		color: var(--ink-2);
		overflow-wrap: anywhere;
	}
</style>
