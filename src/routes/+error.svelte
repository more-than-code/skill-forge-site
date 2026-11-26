<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} · Skill Forge</title>
</svelte:head>

<h1>{page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
<p><a href="/">Home page</a></p>
