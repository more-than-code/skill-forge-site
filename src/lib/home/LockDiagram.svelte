<!-- Value 2: every vendored copy is locked by hash; a changed copy fails the check. -->
<svg class="mini" viewBox="0 0 300 70" role="img" aria-label="Illustrative: a skill copy, its SHA-256 lock, and a check that fails when the copy changes">
	<g class="d-flow"><path d="M92 35 H 112" /><path d="M204 35 H 224" /></g>
	<rect class="d-box" x="4" y="12" width="88" height="46" rx="8" />
	<text class="d-label d-small" x="14" y="32">your repo</text>
	<text class="d-label d-mono" x="14" y="48">.agents/</text>
	<rect class="d-box" x="112" y="12" width="92" height="46" rx="8" />
	<text class="d-label d-small" x="122" y="32">lockfile</text>
	<text class="d-label d-mono" x="122" y="48">sha256-…</text>
	<rect class="d-box-alert" x="224" y="12" width="72" height="46" rx="8" />
	<text class="d-label d-small" x="234" y="32">--check</text>
	<text class="d-label d-mono" x="234" y="48">exit 1</text>
</svg>
