<script lang="ts">
	import type { Skill } from './catalog';

	let { skills }: { skills: Skill[] } = $props();
</script>

<ul class="skills" role="list">
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
		padding: 0;
		margin: 0;
		display: grid;
		gap: 12px;
	}

	li {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 14px 16px;
	}

	.name {
		font-weight: 600;
		font-size: 1.05rem;
		display: inline-block;
		min-height: 28px;
	}

	.version {
		margin-left: 8px;
		font-size: 0.85rem;
	}

	p {
		margin: 4px 0 0;
		color: var(--muted);
		overflow-wrap: anywhere;
	}
</style>
