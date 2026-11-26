<script lang="ts">
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
		border-bottom: 1px solid var(--border);
		background: var(--surface);
	}

	nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 64px;
		flex-wrap: wrap;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		color: var(--text);
		font-weight: 700;
		font-size: 1.1rem;
		text-decoration: none;
	}

	.links {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.links > a:not(.button) {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--text);
		text-decoration: none;
	}

	main {
		padding-top: 32px;
		padding-bottom: 48px;
	}

	footer {
		border-top: 1px solid var(--border);
		font-size: 0.9rem;
	}
</style>
