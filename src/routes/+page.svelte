<script lang="ts">
	import Head from '$lib/Head.svelte';
	import { catalog, findSkill, snapshotDate, tagCounts } from '$lib/catalog';
	import { REPO_URL, SIGN_IN_URL, sourceUrl } from '$lib/links';

	let { data } = $props();
	const tags = tagCounts();
	const shortCommit = catalog.source.commit.slice(0, 7);
	// The example pins two skills at their snapshot versions, so it never goes stale.
	const example = ['coding-discipline', 'security-baseline']
		.map(findSkill)
		.filter((skill) => skill !== undefined)
		.map((skill) => `      "${skill.name}": "^${skill.version}"`)
		.join(',\n');
	const stats = [
		{ value: catalog.counts.skills, label: 'public skills' },
		{ value: tags.length, label: 'tags' },
		{ value: catalog.counts.subagentSets, label: 'subagent sets' },
		{ value: catalog.counts.instructionVariants, label: 'instruction variants' }
	];
</script>

<Head
	title="Skill Forge: versioned skills for coding agents"
	description="Browse the public catalog of agent skills and pin exact versions in your repository, with a lockfile and review like any other code."
	path="/"
/>

<section class="hero">
	<h1>Skills for your coding agents, versioned like code.</h1>
	<p class="lead">
		Skill Forge keeps the skills, instructions and subagents your agents use in a git registry, with
		versions, integrity locks and review. Browse the public catalog, then pin the skills you want in
		your repository.
	</p>
	<div class="actions">
		{#if data.consoleLive}
			<a class="button primary" href={SIGN_IN_URL}>Get started</a>
			<a class="button" href="/skills">Browse skills</a>
		{:else}
			<a class="button primary" href="/skills">Browse skills</a>
			<a class="button" href={REPO_URL}>View on GitHub</a>
		{/if}
	</div>
</section>

<section aria-labelledby="stats">
	<h2 id="stats">The public catalog</h2>
	<ul class="stats" role="list">
		{#each stats as stat (stat.label)}
			<li class="panel"><strong>{stat.value}</strong><span>{stat.label}</span></li>
		{/each}
	</ul>
	<p class="muted">
		Registry {catalog.registryVersion}, as of {snapshotDate()} (commit
		<a href={sourceUrl(catalog.source.commit, '')}><code>{shortCommit}</code></a>).
	</p>
</section>

<section aria-labelledby="how">
	<h2 id="how">How it works</h2>
	<ol class="steps">
		<li>
			<h3>Pick skills</h3>
			<p>Each skill is a reviewed <code>SKILL.md</code> with a version and tags. Browse them here or on GitHub.</p>
		</li>
		<li>
			<h3>Declare them in your repo</h3>
			<p>List the skills and version ranges in <code>skill-forge.json</code>:</p>
			<pre><code>{`{
  "schemaVersion": 2,
  "skills": {
    "dependencies": {
${example}
    }
  }
}`}</code></pre>
		</li>
		<li>
			<h3>Sync exact copies</h3>
			<p>
				<code>skf sync</code> vendors the resolved versions into the repo with a lockfile of SHA-256
				hashes, so every agent session reads the same reviewed text. <code>skf sync --check</code> tells
				you when a pin falls behind.
			</p>
		</li>
	</ol>
</section>

{#if data.consoleLive}
	<section aria-labelledby="console">
		<h2 id="console">Your own registries</h2>
		<p>
			Sign in with GitHub to connect your organisation's private registries and see which skills your
			agents load.
		</p>
		<a class="button primary" href={SIGN_IN_URL}>Sign in with GitHub</a>
	</section>
{/if}

<section aria-labelledby="tags">
	<h2 id="tags">Popular tags</h2>
	<p class="tag-list">
		{#each tags.slice(0, 16) as { tag, count } (tag)}
			<a class="chip" href="/tags/{tag}">{tag} ({count})</a>
		{/each}
	</p>
	<p><a href="/skills">All {catalog.counts.skills} skills</a></p>
</section>

<style>
	section {
		margin-bottom: var(--space-7);
	}

	/* Display size only in the hero (quiet-ui-style-guide section 1), smaller on phones. */
	.hero h1 {
		font-size: clamp(var(--fs-3xl), 5vw, var(--fs-5xl));
		margin: var(--space-4) 0;
		max-width: 20ch;
	}

	.lead {
		font-size: var(--fs-lg);
		color: var(--ink-2);
		max-width: 60ch;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-5);
	}

	.stats {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-3);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: var(--space-3);
	}

	.stats li {
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
	}

	.stats strong {
		font-size: var(--fs-3xl);
		line-height: var(--lh-tight);
	}

	.stats span {
		color: var(--ink-2);
	}

	.steps {
		padding-left: var(--space-5);
		display: grid;
		gap: var(--space-4);
	}

	.steps li {
		min-width: 0;
	}

	.steps h3 {
		margin: 0 0 var(--space-1);
	}

	.steps p {
		margin: 0 0 var(--space-2);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
</style>
