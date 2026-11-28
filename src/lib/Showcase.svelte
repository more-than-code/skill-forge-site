<!-- A skill's showcase (skill-forge docs/SHOWCASE.md): value, how it works, workflow, see it in action.
     Everything comes from the catalog snapshot, checked by scripts/catalog-lib.mjs. The diagram and the
     swatches are drawn here with the shared diagram classes, so they follow the tokens in light and dark. -->
<script lang="ts">
	import type { Showcase } from '$lib/catalog';

	let { name, showcase }: { name: string; showcase: Showcase } = $props();

	// Diagram geometry, in SVG user units: boxes left to right, all as tall as the tallest.
	const BOX = 184;
	const GAP = 40;
	const PAD = 8;
	const stages = $derived(showcase.howItWorks.stages);
	const boxHeight = $derived(40 + 16 * Math.max(...stages.map((stage) => stage.lines.length)));
	const width = $derived(PAD * 2 + stages.length * BOX + (stages.length - 1) * GAP);
	const height = $derived(boxHeight + PAD * 2);
	const x = (i: number) => PAD + i * (BOX + GAP);

</script>

<section class="showcase" aria-labelledby="value-title">
	<header class="section-head">
		<p class="eyebrow">Why it matters</p>
		<h2 id="value-title">What it gives a team</h2>
	</header>
	<p class="lead">{showcase.value}</p>
</section>

<section class="showcase" aria-labelledby="how-title">
	<header class="section-head">
		<p class="eyebrow">How it works</p>
		<h2 id="how-title">{showcase.howItWorks.title}</h2>
	</header>
	<figure class="figure wide">
		<svg class="flow" viewBox="0 0 {width} {height}" role="img" aria-labelledby="how-svg-title" aria-describedby="how-svg-desc">
			<title id="how-svg-title">{showcase.howItWorks.title}</title>
			<desc id="how-svg-desc">{stages.map((stage) => `${stage.name}: ${stage.lines.join(' ')}`).join('. Then ')}.</desc>
			<g class="d-flow">
				{#each stages.slice(1) as _, i (i)}
					<path d="M{x(i) + BOX} {PAD + boxHeight / 2} H{x(i + 1)}" />
				{/each}
			</g>
			{#each stages as stage, i (i)}
				<rect class={stage.accent ? 'd-box-accent' : 'd-box'} x={x(i)} y={PAD} width={BOX} height={boxHeight} rx="8" />
				<text class="d-label d-strong" x={x(i) + 12} y={PAD + 24}>{stage.name}</text>
				{#each stage.lines as line, j (j)}
					<text class="d-label d-small" x={x(i) + 12} y={PAD + 44 + 16 * j}>{line}</text>
				{/each}
			{/each}
		</svg>
	</figure>
</section>

<section class="showcase" aria-labelledby="workflow-title">
	<header class="section-head">
		<p class="eyebrow">Workflow</p>
		<h2 id="workflow-title">What the agent does</h2>
	</header>
	<ol class="steps">
		{#each showcase.workflow as step, i (i)}
			<li>{step}</li>
		{/each}
	</ol>
</section>

<section class="showcase" aria-labelledby="action-title">
	<header class="section-head">
		<p class="eyebrow">See it in action</p>
		<h2 id="action-title">Run on our own products</h2>
	</header>
	<div class="samples">
		{#each showcase.inAction as item, i (i)}
			<figure class="figure sample">
				{#if item.kind === 'image'}
					<img src="/showcase/{name}/{item.file}" alt={item.alt} loading="lazy" />
				{:else if item.kind === 'excerpt'}
					<pre><code>{item.excerpt}</code></pre>
				{:else if item.kind === 'swatches'}
					<ul class="swatches">
						{#each item.swatches as swatch, k (k)}
							<li>
								<svg class="chip-colour" viewBox="0 0 40 40" aria-hidden="true">
									<rect class="swatch" x="0.5" y="0.5" width="39" height="39" rx="6" fill={swatch.hex} />
								</svg>
								<span class="swatch-name">{swatch.name}</span>
								<code>{swatch.hex}</code>
							</li>
						{/each}
					</ul>
				{/if}
				<figcaption>
					{item.caption}
					<span class="source">Source: {item.source}</span>
				</figcaption>
			</figure>
		{/each}
	</div>
</section>

<style>
	.showcase {
		margin: var(--space-7) 0;
	}

	.lead {
		max-width: 48rem;
		font-size: var(--fs-lg);
		margin: 0;
	}

	.steps {
		max-width: 48rem;
		margin: 0;
		padding-left: var(--space-5);
	}

	.steps li {
		margin-bottom: var(--space-2);
	}

	.samples {
		display: grid;
		gap: var(--space-5);
	}

	/* Grid items may shrink below their content, so a long excerpt scrolls inside its frame. */
	.sample {
		min-width: 0;
	}

	.sample img {
		display: block;
		width: 100%;
		height: auto;
		border-radius: var(--r-md);
	}

	/* Excerpts are short report lines: wrap them rather than scroll. */
	.sample pre {
		margin: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	/* At most 4 stages (872 units), so text stays near its size; on phones the flow scrolls inside figure.wide. */
	.figure.wide .flow {
		min-width: 720px;
	}

	/* The swatch keeps the brand colour as data; its edge makes light swatches visible on the surface. */
	.swatch {
		stroke: var(--line-strong);
		stroke-width: 1;
	}

	.swatches {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.swatches li {
		display: grid;
		gap: var(--space-1);
		font-size: var(--fs-sm);
	}

	.chip-colour {
		display: block;
		width: 100%;
		height: auto;
		max-width: 4rem;
	}

	.swatches code {
		color: var(--ink-2);
		font-size: var(--fs-xs);
	}

	.source {
		display: block;
		margin-top: var(--space-1);
		font-size: var(--fs-xs);
	}
</style>
