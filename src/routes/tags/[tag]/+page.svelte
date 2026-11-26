<script lang="ts">
	import Head from '$lib/Head.svelte';
	import SkillList from '$lib/SkillList.svelte';

	let { data } = $props();
</script>

<Head
	title="{data.tag} skills · Skill Forge"
	description="Skills tagged {data.tag} in the Skill Forge public catalog."
	path="/tags/{data.tag}"
/>

<p><a href="/skills">All skills</a></p>
<h1>Tagged <span class="chip tag">{data.tag}</span></h1>
<p class="muted">{data.skills.length} {data.skills.length === 1 ? 'skill' : 'skills'}</p>

<SkillList skills={data.skills} />

<style>
	.tag {
		font-size: 1.2rem;
		vertical-align: middle;
	}
</style>
