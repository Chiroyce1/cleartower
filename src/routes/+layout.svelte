<script lang="ts">
	import { ModeWatcher } from "mode-watcher";
	import "../app.css";
	import Nav from "$lib/components/Nav.svelte";
	let { children } = $props();
</script>

<ModeWatcher />

<svelte:head>
	<title>ClearTower</title>

	<meta name="description" content="ClearTower" />
	<link rel="shortcut icon" href="fav.svg" type="image/svg+xml" />
	<meta
		name="description"
		content="ClearTower is a clean UI for ATC audio streams from LiveATC.net"
	/>
	<meta name="keywords" content="ATC, LiveATC, aviation, air traffic control" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://cleartower.vercel.app" />
	<meta property="og:title" content="ClearTower" />
	<meta
		property="og:description"
		content="ClearTower is a clean UI for ATC audio streams from LiveATC.net"
	/>
	<meta property="og:image" content="/og.jpg" />
</svelte:head>

<div class="p-4 mx-auto page">
	<Nav />
	{@render children()}
</div>
