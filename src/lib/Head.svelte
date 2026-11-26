<script lang="ts">
	// Title, description, canonical and Open Graph tags for one page. URLs use SITE_URL on every
	// host, so pages.dev previews never become canonical.
	import { SITE_URL } from './links';

	let { title, description, path }: { title: string; description: string; path: string } = $props();
	const url = $derived(`${SITE_URL}${path === "/" ? "" : path}`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Skill Forge" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta name="twitter:card" content="summary" />
</svelte:head>
