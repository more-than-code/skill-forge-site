<!-- Hero visual: one registry, many consumers, each holding the same locked version. Illustrative names. -->
<figure class="figure">
	<svg viewBox="0 0 360 250" role="img" aria-labelledby="fanout-title fanout-desc">
		<title id="fanout-title">One registry, every repo and session</title>
		<desc id="fanout-desc">
			A registry holding security-baseline 0.1.0 feeds three repositories and a cloud agent session, each
			with the same version and hash.
		</desc>
		<g class="d-flow">
			<path d="M120 125 C 160 125, 170 40, 210 40" />
			<path d="M120 125 C 160 125, 170 100, 210 100" />
			<path d="M120 125 C 160 125, 170 160, 210 160" />
			<path d="M120 125 C 160 125, 170 220, 210 220" />
		</g>
		<rect class="d-box-accent" x="8" y="85" width="112" height="80" rx="10" />
		<text class="d-label d-strong" x="20" y="110">Registry</text>
		<text class="d-label d-small" x="20" y="130">security-baseline</text>
		<text class="d-label d-mono" x="20" y="150">0.1.0 · reviewed</text>
		{#each [['acme-api', 40], ['acme-web', 100], ['acme-mobile', 160], ['cloud session', 220]] as [name, y] (name)}
			<rect class="d-box" x="210" y={Number(y) - 22} width="142" height="44" rx="8" />
			<text class="d-label" x="222" y={Number(y) - 3}>{name}</text>
			<text class="d-label d-mono d-muted" x="222" y={Number(y) + 13}>0.1.0 sha256-6BrE…</text>
		{/each}
	</svg>
	<figcaption>Illustrative: one reviewed version, the same bytes everywhere.</figcaption>
</figure>
