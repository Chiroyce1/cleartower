<script lang="ts">
	import "../app.css";
	import Nav from "$lib/components/Nav.svelte";
	import { theme } from "$lib/theme"; // initialises class on <html> at module load
	let { children } = $props();
</script>

<svelte:head>
	<title>ClearTower</title>
	<meta
		name="description"
		content="ClearTower — live ATC audio streams, minimal."
	/>
	<!-- Favicon -->
	<link rel="icon" href="/icon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/icon.svg" />
	<link rel="manifest" href="/manifest.json" />
	<!-- OpenGraph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://cleartower.vercel.app" />
	<meta property="og:title" content="ClearTower" />
	<meta property="og:description" content="Live ATC audio. Minimal UI." />
	<meta property="og:image" content="/icon.svg" />
	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="ClearTower" />
	<meta name="twitter:description" content="Live ATC audio. Minimal UI." />
	<meta name="twitter:image" content="/icon.svg" />
</svelte:head>

<div class="min-h-screen flex flex-col max-w-4xl mx-auto px-4">
	<Nav />
	{@render children()}
</div>

<footer class="text-center mx-auto w-1/2 mb-6">
	<span class="text-sm font-mono text-foreground/60"
		><a href="https://liveatc.net/" target="_blank">
			audio from <b class="hover:underline">liveatc.net</b></a
		>
		⋅
		<a href="https://github.com/Chiroyce1/cleartower" target="_blank">
			source on <b class="hover:underline">github</b></a
		></span
	>
</footer>
