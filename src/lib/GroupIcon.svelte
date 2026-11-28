<script lang="ts">
	// One icon per catalog group (ids in groups.js). Drawn for this site: 24px grid, 1.75 stroke,
	// currentColor, so the parent sets the colour from tokens. Always decorative: the group name is text.
	let { id, size = 20 }: { id: string; size?: number } = $props();
</script>

<svg class="group-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
	{#if id === 'review'}
		<circle cx="10.5" cy="10.5" r="6.5" />
		<path d="M15.5 15.5 21 21" />
		<path d="m7.8 10.6 1.9 1.9 3.6-3.8" />
	{:else if id === 'security'}
		<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6Z" />
		<path d="m8.8 12 2.2 2.2 4.2-4.4" />
	{:else if id === 'testing'}
		<path d="M9 3h6" />
		<path d="M10 3v6.2L4.8 18.4A1.7 1.7 0 0 0 6.3 21h11.4a1.7 1.7 0 0 0 1.5-2.6L14 9.2V3" />
		<path d="M7.5 15h9" />
	{:else if id === 'design'}
		<circle cx="9" cy="9" r="5" />
		<circle cx="15" cy="9" r="5" />
		<circle cx="12" cy="14.5" r="5" />
	{:else if id === 'ops'}
		<rect x="4" y="4" width="16" height="6.5" rx="1.5" />
		<rect x="4" y="13.5" width="16" height="6.5" rx="1.5" />
		<path d="M7.5 7.25h.01M7.5 16.75h.01M11 7.25h5M11 16.75h5" />
	{:else if id === 'setup'}
		<path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
		<circle cx="15" cy="7" r="2" />
		<circle cx="9" cy="17" r="2" />
	{:else if id === 'roles'}
		<circle cx="9" cy="8.5" r="3.25" />
		<path d="M3.5 19.5c.6-3 2.8-5 5.5-5s4.9 2 5.5 5" />
		<circle cx="16.5" cy="9.5" r="2.5" />
		<path d="M16 14.6c2.3.2 4 1.9 4.5 4.4" />
	{:else}
		<path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8Z" />
		<path d="m3.5 12 8.5 4.5 8.5-4.5" />
		<path d="m3.5 16 8.5 4.5 8.5-4.5" />
	{/if}
</svg>

<style>
	.group-icon {
		flex: none;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.75;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
