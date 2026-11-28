<script lang="ts">
	import '$lib/tokens/tokens.css';
	import '../app.css';
	import { REPO_URL, SIGN_IN_URL } from '$lib/links';

	let { data, children } = $props();
</script>

<header>
	<nav class="wrap" aria-label="Main">
		<a class="brand" href="/">
			<img src="/favicon.svg" alt="" width="28" height="28" />
			<span>Skill Forge</span>
		</a>
		<div class="links">
			<a href="/skills">Skills</a>
			<a href={REPO_URL}>GitHub</a>
			{#if data.consoleLive}
				<a class="button primary" href={SIGN_IN_URL}>Sign in</a>
			{/if}
		</div>
	</nav>
</header>

<main class="wrap">
	{@render children()}
</main>

<footer>
	<div class="wrap muted">
		<p>
			Skill Forge's registry and <code>skf</code> CLI are open source under the MIT licence:
			<a href={REPO_URL}>more-than-code/skill-forge</a>.
		</p>
	</div>
</footer>

<style>
	header {
		border-bottom: 1px solid var(--line);
		background: var(--surface);
	}

	nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-height: 64px; /* off-scale: header height */
		flex-wrap: wrap;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 44px;
		color: var(--ink);
		font-weight: var(--fw-bold);
		font-size: var(--fs-lg);
		text-decoration: none;
	}

	/* The mark's tile is a fixed dark slate; a hairline keeps its edge visible on the dark header. */
	.brand img {
		border-radius: var(--r-sm);
		box-shadow: 0 0 0 1px var(--line-2);
	}

	.links {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.links > a:not(.button) {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--ink);
		text-decoration: none;
	}

	.links > a:not(.button):hover {
		color: var(--accent-ink);
	}

	main {
		padding-top: var(--space-6);
		padding-bottom: var(--space-7);
	}

	footer {
		border-top: 1px solid var(--line);
		font-size: var(--fs-sm);
	}
</style>
