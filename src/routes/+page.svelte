<script lang="ts">
	import Head from '$lib/Head.svelte';
	import { catalog, findSkill, snapshotDate, tagCounts } from '$lib/catalog';
	import { REPO_URL, SIGN_IN_URL, sourceUrl } from '$lib/links';
	import FanoutDiagram from '$lib/home/FanoutDiagram.svelte';
	import ReviewDiagram from '$lib/home/ReviewDiagram.svelte';
	import LockDiagram from '$lib/home/LockDiagram.svelte';
	import AgentsDiagram from '$lib/home/AgentsDiagram.svelte';
	import ArchitectureDiagram from '$lib/home/ArchitectureDiagram.svelte';

	let { data } = $props();
	const tags = tagCounts();
	const shortCommit = catalog.source.commit.slice(0, 7);
	// The example pins two skills at their snapshot versions, so it never goes stale.
	const pinned = ['coding-discipline', 'security-baseline']
		.map(findSkill)
		.filter((skill) => skill !== undefined);
	const example = pinned.map((skill) => `      "${skill.name}": "^${skill.version}"`).join(',\n');
	const syncOutput = pinned.map((skill) => `  ${skill.name}@${skill.version} -> .agents/skills`).join('\n');
	const stats = [
		{ value: catalog.counts.skills, label: 'public skills' },
		{ value: tags.length, label: 'tags' },
		{ value: catalog.counts.subagentSets, label: 'subagent sets' },
		{ value: catalog.counts.instructionVariants, label: 'instruction variants' }
	];
	const installCommand = `npm install -g git+${REPO_URL}.git`;
</script>

<Head
	title="Skill Forge: versioned skills for coding agents"
	description="Every agent session starts from the same reviewed rules. Skill Forge versions and locks the skills, instructions and subagents your coding agents load."
	path="/"
/>

<section class="hero">
	<div class="hero-text">
		<h1>Every agent session starts from the same reviewed rules.</h1>
		<p class="lead">
			Skill Forge versions the skills, instructions and subagents your coding agents load. A change is
			reviewed once, then reaches every repository and every cloud session as an exact, hash-locked copy.
		</p>
		<div class="actions">
			{#if data.consoleLive}
				<a class="button primary" href={SIGN_IN_URL}>Get started</a>
			{:else}
				<a class="button primary" href="#install">Install skf</a>
			{/if}
			<a class="scroll-link" href="#action">See it in action ↓</a>
		</div>
	</div>
	<FanoutDiagram />
</section>

<section aria-labelledby="value">
	<header class="section-head">
		<p class="eyebrow">Why teams use it</p>
		<h2 id="value">Agent rules you can trust, like the rest of your code</h2>
	</header>
	<ul class="points" role="list">
		<li class="panel">
			<ReviewDiagram />
			<h3>Review a change once</h3>
			<p>Skills live in a git registry. A change goes through a pull request and ships as a new version, not as an unreviewed edit in some repo.</p>
		</li>
		<li class="panel">
			<LockDiagram />
			<h3>Know exactly what your agent read</h3>
			<p>Each repo keeps a lockfile of SHA-256 hashes. <code>skf sync --check</code> fails when a copy is edited or falls behind.</p>
		</li>
		<li class="panel">
			<AgentsDiagram />
			<h3>One source for every agent tool</h3>
			<p>Instructions and subagents are written for Claude Code, Codex, Copilot CLI and Grok from one inventory; Claude cloud sessions install the same skills at start-up.</p>
		</li>
	</ul>
</section>

<section aria-labelledby="action">
	<header class="section-head">
		<p class="eyebrow">See it in action</p>
		<h2 id="action">From a reviewed skill to a checked repo in four steps</h2>
	</header>
	<ol class="walk" role="list">
		<li>
			<div class="step-text">
				<span class="step-num" aria-hidden="true">1</span>
				<h3>Declare the skills</h3>
				<p>List skills and version ranges in your repo's <code>skill-forge.json</code>.</p>
			</div>
			<div class="mock">
				<p class="mock-bar"><span>acme-app/skill-forge.json</span><span>Illustrative interface</span></p>
				<pre><code>{`{
  "schemaVersion": 2,
  "skills": {
    "dependencies": {
${example}
    }
  }
}`}</code></pre>
			</div>
		</li>
		<li>
			<div class="step-text">
				<span class="step-num" aria-hidden="true">2</span>
				<h3>Sync exact copies</h3>
				<p><code>skf sync</code> resolves each range and vendors the files into the repo, where every agent session reads them.</p>
			</div>
			<div class="mock">
				<p class="mock-bar"><span>acme-app</span><span>Illustrative interface</span></p>
				<pre><code>{`$ skf sync
${syncOutput}
Wrote skill-forge.lock.json (${pinned.length} registry, 0 local skill(s)).`}</code></pre>
			</div>
		</li>
		<li>
			<div class="step-text">
				<span class="step-num" aria-hidden="true">3</span>
				<h3>Commit the lock</h3>
				<p>The lockfile records each skill's version and hash, so a review shows exactly what changed.</p>
			</div>
			<div class="mock">
				<p class="mock-bar"><span>acme-app/skill-forge.lock.json</span><span>Illustrative interface</span></p>
				<pre><code>{`"security-baseline": {
  "version": "0.1.0",
  "integrity": "sha256-6BrEv3S5yb6Pak…",
  "source": "registry"
}`}</code></pre>
			</div>
		</li>
		<li>
			<div class="step-text">
				<span class="step-num" aria-hidden="true">4</span>
				<h3>Catch drift in CI</h3>
				<p>Someone edits a vendored copy by hand. <code>skf sync --check</code> exits 1 and names it.</p>
			</div>
			<div class="mock">
				<p class="mock-bar"><span>acme-app · CI</span><span>Illustrative interface</span></p>
				<pre><code>{`$ skf sync --check
! .agents/skills/security-baseline differs from the resolved skill; run "skf sync".
`}<span class="exit">exit 1</span></code></pre>
			</div>
		</li>
	</ol>
</section>

<section aria-labelledby="uses">
	<header class="section-head">
		<p class="eyebrow">Use cases</p>
		<h2 id="uses">What teams do with it today</h2>
	</header>
	<ul class="cases" role="list">
		<li class="panel">
			<h3>One security baseline everywhere</h3>
			<p>Pin <code>security-baseline</code> in every repo; a reviewed update reaches all of them on the next sync.</p>
		</li>
		<li class="panel">
			<h3>Cloud sessions that match your laptop</h3>
			<p>A Claude cloud environment's setup script installs the repo's declared skills, and a doctor reports what is missing.</p>
		</li>
		<li class="panel">
			<h3>Instructions per project</h3>
			<p>An instruction variant renders the shared rules plus project specifics into that repo's <code>AGENTS.md</code> or <code>CLAUDE.md</code>.</p>
		</li>
	</ul>
</section>

<section aria-labelledby="parts">
	<header class="section-head">
		<p class="eyebrow">How it is built</p>
		<h2 id="parts">A git registry, a CLI, and the files your agents already read</h2>
	</header>
	<ArchitectureDiagram />
	<ul class="stats" role="list">
		{#each stats as stat (stat.label)}
			<li class="panel"><strong>{stat.value}</strong><span>{stat.label}</span></li>
		{/each}
	</ul>
	<p class="muted small">
		Public catalog: registry {catalog.registryVersion}, as of {snapshotDate()} (commit
		<a href={sourceUrl(catalog.source.commit, '')}><code>{shortCommit}</code></a>).
	</p>
</section>

<section aria-labelledby="compare">
	<header class="section-head">
		<p class="eyebrow">Compared with</p>
		<h2 id="compare">Copying skill files by hand</h2>
	</header>
	<table class="compare">
		<thead>
			<tr><th scope="col">Question</th><th scope="col">Skill Forge</th><th scope="col">Copying by hand</th></tr>
		</thead>
		<tbody>
			<tr>
				<th scope="row">Does every repo get the same reviewed version?</th>
				<td data-label="Skill Forge">Yes: a version range in the manifest, an exact hash in the lock.</td>
				<td data-label="Copying by hand">Only if someone copies it everywhere.</td>
			</tr>
			<tr>
				<th scope="row">Will I notice a stale or edited copy?</th>
				<td data-label="Skill Forge">Yes: <code>skf sync --check</code> fails.</td>
				<td data-label="Copying by hand">Not unless someone diffs it.</td>
			</tr>
			<tr>
				<th scope="row">Is a change reviewed before agents load it?</th>
				<td data-label="Skill Forge">Yes: a pull request on the registry.</td>
				<td data-label="Copying by hand">Depends on each repo.</td>
			</tr>
		</tbody>
	</table>
	<details class="more">
		<summary>Full comparison</summary>
		<table class="compare">
			<thead>
				<tr><th scope="col">Question</th><th scope="col">Skill Forge</th><th scope="col">Copying by hand</th></tr>
			</thead>
			<tbody>
				<tr>
					<th scope="row">Does it cover instructions and subagents, not only skills?</th>
					<td data-label="Skill Forge">Yes, for Claude Code, Codex, Copilot CLI and Grok.</td>
					<td data-label="Copying by hand">Each file, for each tool, by hand.</td>
				</tr>
				<tr>
					<th scope="row">Does it work in cloud agent sessions?</th>
					<td data-label="Skill Forge">Yes: the skf-cloud setup script installs declared skills when a Claude cloud session starts.</td>
					<td data-label="Copying by hand">Only copies committed to the repo.</td>
				</tr>
				<tr>
					<th scope="row">Can I check a registry before release?</th>
					<td data-label="Skill Forge">Yes: <code>skf validate</code> fails on a stale lock or bad metadata.</td>
					<td data-label="Copying by hand">No shared check.</td>
				</tr>
				<tr>
					<th scope="row">What does it cost?</th>
					<td data-label="Skill Forge">Free: the registry and CLI are open source (MIT).</td>
					<td data-label="Copying by hand">Free, plus the time to keep copies in step.</td>
				</tr>
			</tbody>
		</table>
	</details>
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

<section class="band panel" aria-labelledby="install">
	<h2 id="install">Install skf and pin your first skill</h2>
	<ol class="install-steps">
		<li>Install the CLI (Node 18 or later):<pre><code>{installCommand}</code></pre></li>
		<li>Add a skill to <code>skill-forge.json</code> as in step 1 above, then run <code>skf sync</code>.</li>
	</ol>
	<p class="band-actions">
		<a class="button primary" href="/skills">Browse all {catalog.counts.skills} skills</a>
		<a href={REPO_URL}>Read the docs on GitHub</a>
	</p>
</section>

<style>
	section {
		margin-bottom: var(--space-8);
	}

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: var(--space-6);
		align-items: center;
		padding-top: var(--space-5);
	}

	/* Display size only in the hero, smaller on phones. */
	.hero h1 {
		font-size: clamp(var(--fs-3xl), 4.6vw, var(--fs-5xl));
		margin: 0 0 var(--space-4);
		max-width: 18ch;
	}

	.lead {
		font-size: var(--fs-lg);
		color: var(--ink-2);
		max-width: 52ch;
		margin: 0;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-5);
		margin-top: var(--space-5);
	}

	.scroll-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-weight: var(--fw-bold);
		text-decoration: none;
	}

	.scroll-link:hover {
		text-decoration: underline;
	}

	.points,
	.cases {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-4);
	}

	.points li,
	.cases li {
		padding: var(--space-5);
	}

	.points h3,
	.cases h3 {
		margin: var(--space-4) 0 var(--space-2);
	}

	.cases h3 {
		margin-top: 0;
	}

	.points p,
	.cases p {
		margin: 0;
		color: var(--ink-2);
	}

	.walk {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-5);
	}

	.walk li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
		gap: var(--space-5);
		align-items: start;
	}

	.walk li > *,
	.install-steps li {
		min-width: 0;
	}

	.step-text h3 {
		margin: var(--space-2) 0 var(--space-1);
	}

	.step-text p {
		margin: 0;
		color: var(--ink-2);
	}

	.step-num {
		display: inline-grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: var(--r-pill);
		background: var(--accent-wash);
		color: var(--accent-ink);
		font-weight: var(--fw-bold);
		font-size: var(--fs-sm);
	}

	.exit {
		color: var(--critical);
		font-weight: var(--fw-bold);
	}

	.stats {
		list-style: none;
		padding: 0;
		margin: var(--space-4) 0 var(--space-3);
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

	.small {
		font-size: var(--fs-sm);
	}

	.more {
		margin-top: var(--space-3);
	}

	.more summary {
		cursor: pointer;
		min-height: 44px;
		display: flex;
		align-items: center;
		font-weight: var(--fw-bold);
		color: var(--accent-ink);
	}

	.band {
		padding: var(--space-6);
		background: var(--accent-wash);
	}

	.band h2 {
		margin-top: 0;
	}

	.install-steps {
		padding-left: var(--space-5);
		display: grid;
		gap: var(--space-3);
	}

	.install-steps pre {
		margin-top: var(--space-2);
		background: var(--surface);
	}

	.band-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-5);
		margin: var(--space-5) 0 0;
	}

	@media (max-width: 960px) {
		.hero,
		.walk li {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
