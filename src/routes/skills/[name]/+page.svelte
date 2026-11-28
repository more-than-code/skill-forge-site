<script lang="ts">
	import Head from '$lib/Head.svelte';
	import { catalog } from '$lib/catalog';
	import { sourceUrl } from '$lib/links';

	let { data } = $props();
	const skill = $derived(data.skill);
	const manifest = $derived(`"${skill.name}": "^${skill.version}"`);
</script>

<Head title="{skill.name} · Skill Forge" description={skill.description} path="/skills/{skill.name}" />

<p><a href="/skills">All skills</a></p>
<h1>{skill.name} <span class="muted version">{skill.version}</span></h1>
<p class="description">{skill.description}</p>

{#if skill.tags.length > 0}
	<p class="tags">
		{#each skill.tags as tag (tag)}
			<a class="chip" href="/tags/{tag}">{tag}</a>
		{/each}
	</p>
{/if}

<h2>Use it</h2>
<p>Add it to <code>skills.dependencies</code> in your repo's <code>skill-forge.json</code>, then run <code>skf sync</code>:</p>
<pre><code>{manifest}</code></pre>

<h2>Files</h2>
<ul>
	{#each skill.files as file (file)}
		<li><a href={sourceUrl(catalog.source.commit, `${skill.path}/${file}`)}><code>{file}</code></a></li>
	{/each}
</ul>

<style>
	.version {
		font-size: var(--fs-md);
		font-weight: var(--fw-regular);
	}

	h1 {
		overflow-wrap: anywhere;
	}

	.description {
		font-size: var(--fs-lg);
		max-width: 70ch;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	li {
		min-height: 32px;
	}
</style>
