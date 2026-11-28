<script lang="ts">
	import Head from '$lib/Head.svelte';
	import SkillList from '$lib/SkillList.svelte';
	import { catalog, snapshotDate, tagCounts } from '$lib/catalog';
</script>

<Head
	title="Skills · Skill Forge"
	description="Every skill in the Skill Forge public catalog, with its version, tags and description."
	path="/skills"
/>

<h1>Skills</h1>
<p class="muted">
	{catalog.counts.skills} skills in the public catalog, as of {snapshotDate()}. Filter by tag:
</p>
<p class="tags">
	{#each tagCounts() as { tag } (tag)}
		<a class="chip" href="/tags/{tag}">{tag}</a>
	{/each}
</p>

<SkillList skills={catalog.skills} />

<style>
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-5);
	}
</style>
