<script lang="ts">
	import Head from '$lib/Head.svelte';
	import SkillList from '$lib/SkillList.svelte';
	import GroupIcon from '$lib/GroupIcon.svelte';
	import { catalog, snapshotDate, tagCounts } from '$lib/catalog';
	import { groupSkills } from '$lib/groups.js';

	const groups = groupSkills(catalog.skills);
</script>

<Head
	title="Skills · Skill Forge"
	description="Every skill in the Skill Forge public catalog, grouped by what it is for, with its version and a one-line summary."
	path="/skills"
/>

<h1>Skills</h1>
<p class="muted">
	{catalog.counts.skills} skills in the public catalog, as of {snapshotDate()}, grouped by what they are for.
</p>

<nav class="jump" aria-label="Skill groups">
	{#each groups as { group, skills } (group.id)}
		<a href="#{group.id}"><GroupIcon id={group.id} size={16} />{group.title}<span class="count">{skills.length}</span></a>
	{/each}
</nav>

{#each groups as { group, skills } (group.id)}
	<section class="group" aria-labelledby={group.id}>
		<header>
			<span class="tile"><GroupIcon id={group.id} size={22} /></span>
			<div>
				<h2 id={group.id}>{group.title} <span class="count">{skills.length}</span></h2>
				<p class="muted">{group.blurb}</p>
			</div>
		</header>
		<SkillList {skills} />
	</section>
{/each}

<details class="by-tag">
	<summary>Browse by tag</summary>
	<p class="tags">
		{#each tagCounts() as { tag } (tag)}
			<a class="chip" href="/tags/{tag}">{tag}</a>
		{/each}
	</p>
</details>

<style>
	.jump {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: var(--space-5) 0 var(--space-6);
	}

	.jump a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 36px; /* off-scale: a comfortable target for a jump link */
		padding: 0 var(--space-3);
		border-radius: var(--r-md);
		background: var(--surface);
		box-shadow: var(--edge);
		outline: 1px solid transparent;
		color: var(--ink);
		font-size: var(--fs-sm);
		text-decoration: none;
	}

	.jump a:hover {
		background: var(--surface-2);
	}

	.count {
		color: var(--ink-2);
		font-size: var(--fs-sm);
		font-weight: var(--fw-regular);
	}

	.group {
		margin-bottom: var(--space-7);
		scroll-margin-top: var(--space-4);
	}

	.group header {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
		margin-bottom: var(--space-3);
	}

	.tile {
		display: inline-grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: var(--r-md);
		background: var(--accent-wash);
		color: var(--accent-ink);
		flex: none;
	}

	.group h2 {
		margin: 0;
		font-size: var(--fs-xl);
	}

	.group header p {
		margin: var(--space-1) 0 0;
	}

	.by-tag summary {
		cursor: pointer;
		min-height: 44px;
		display: flex;
		align-items: center;
		font-weight: var(--fw-bold);
		color: var(--accent-ink);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
</style>
