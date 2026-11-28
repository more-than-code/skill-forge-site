<!-- Components: the registry, the CLI, and where it writes. Paths match skill-forge dev. -->
<figure class="figure wide">
	<svg viewBox="0 0 640 300" role="img" aria-labelledby="arch-title arch-desc">
		<title id="arch-title">How Skill Forge is put together</title>
		<desc id="arch-desc">
			A git registry with registry.json, the inventory and a lockfile. The skf CLI reads it and writes three
			places: your repository's manifest, lockfile and skill copies; each agent tool's instruction, subagent
			and hook files; and, through the skf-cloud setup script, Claude cloud sessions.
		</desc>
		<g class="d-flow">
			<path d="M200 150 H 250" />
			<path d="M370 150 C 400 150, 400 55, 430 55" />
			<path d="M370 150 H 430" />
			<path d="M370 150 C 400 150, 400 245, 430 245" />
		</g>
		<rect class="d-box-accent" x="8" y="60" width="192" height="180" rx="12" />
		<text class="d-label d-strong" x="24" y="88">Registry (git)</text>
		<text class="d-label d-mono" x="24" y="116">registry.json</text>
		<text class="d-label d-mono" x="24" y="138">inventory/skills</text>
		<text class="d-label d-mono" x="24" y="160">inventory/agents</text>
		<text class="d-label d-mono" x="24" y="182">inventory/subagents</text>
		<text class="d-label d-mono" x="24" y="204">registry-lock.json</text>
		<text class="d-label d-small d-muted" x="24" y="226">versions + SHA-256</text>

		<rect class="d-box" x="250" y="110" width="120" height="80" rx="10" />
		<text class="d-label d-strong" x="266" y="138">skf CLI</text>
		<text class="d-label d-mono d-muted" x="266" y="160">sync · validate</text>
		<text class="d-label d-mono d-muted" x="266" y="178">lock · install</text>

		<rect class="d-box" x="430" y="15" width="202" height="80" rx="10" />
		<text class="d-label d-strong" x="446" y="40">Your repo</text>
		<text class="d-label d-mono" x="446" y="62">skill-forge.json</text>
		<text class="d-label d-mono" x="446" y="82">.lock.json · .agents/skills</text>

		<rect class="d-box" x="430" y="110" width="202" height="80" rx="10" />
		<text class="d-label d-strong" x="446" y="135">Agent tool files</text>
		<text class="d-label d-mono" x="446" y="157">CLAUDE.md · AGENTS.md</text>
		<text class="d-label d-mono" x="446" y="177">subagents · hooks</text>

		<rect class="d-box" x="430" y="205" width="202" height="80" rx="10" />
		<text class="d-label d-strong" x="446" y="230">Claude cloud sessions</text>
		<text class="d-label d-mono" x="446" y="252">skf-cloud setup script</text>
		<text class="d-label d-mono" x="446" y="272">+ doctor</text>
	</svg>
	<figcaption>The repository is the source of truth; everything on the right is a deployment target.</figcaption>
</figure>
