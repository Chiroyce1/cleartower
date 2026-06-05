<script lang="ts">
	import type { PageData } from "./$types";
	import type { AtcFeed } from "$lib/feeds";
	import Stream from "$lib/components/Stream.svelte";

	let { data }: { data: PageData } = $props();

	// ── Player state ──────────────────────────────────────────────────
	let activeFeed: AtcFeed | null = $state(null);

	// ── Search state ─────────────────────────────────────────────────
	let query = $state("");
	let searchResults: { icao: string; feeds: AtcFeed[] }[] = $state([]);
	let searching = $state(false);
	let searchDone = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	function onInput() {
		clearTimeout(debounceTimer);
		const q = query.trim();
		if (!q || q.length < 2) {
			searchResults = [];
			searchDone = false;
			return;
		}
		debounceTimer = setTimeout(async () => {
			searching = true;
			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
				const data = await res.json();
				searchResults = data.airports ?? [];
				searchDone = true;
			} finally {
				searching = false;
			}
		}, 250);
	}

	// ── Display logic ─────────────────────────────────────────────────
	// Show search results if query is active, otherwise show presets
	const showResults = $derived(query.trim().length >= 2);
	const displayAirports = $derived(showResults ? searchResults : data.presets);

	// ── Feed type helpers ─────────────────────────────────────────────
	const TYPE_LABEL: Record<string, string> = {
		tower: "Tower",
		ground: "Ground",
		approach: "Approach",
		departure: "Departure",
		atis: "ATIS",
		center: "Center",
		combined: "All",
	};
	const TYPE_DOT: Record<string, string> = {
		tower: "#facc15",
		ground: "#34d399",
		approach: "#38bdf8",
		departure: "#fb923c",
		atis: "rgba(255,255,255,0.3)",
		center: "#a5b4fc",
		combined: "#2dd4bf",
	};
</script>

<main class="py-10 flex flex-col gap-8">
	<!-- Hero search -->
	<div class="flex flex-col gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">
				Clear<span class="text-yellow-400">Tower</span>
			</h1>
			<p class="text-sm text-foreground/60 mt-1">
				Search any airport by ICAO code or city name.
			</p>
		</div>

		<!-- Search input -->
		<div class="relative">
			<input
				bind:value={query}
				oninput={onInput}
				type="search"
				placeholder="e.g. KJFK, Heathrow, Tokyo…"
				spellcheck="false"
				autocomplete="off"
				class="w-full bg-surface-input border border-black/10 dark:border-white/12 rounded-lg px-4 py-3 text-base
					placeholder:text-foreground/30 focus:outline-none focus:border-yellow-400/60
					transition-[border-color] pr-10"
			/>
			{#if searching}
				<span
					class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-yellow-400/40 border-t-yellow-400 rounded-full animate-spin"
				></span>
			{/if}
		</div>
	</div>

	<!-- Results / presets -->
	<div class="flex flex-col gap-3">
		{#if !showResults}
			<p class="text-xs text-foreground/60">Featured airports</p>
		{:else if searchDone && searchResults.length === 0}
			<p class="text-sm text-foreground/60 py-6 text-center">
				No airports found for "<span class="text-foreground/50">{query}</span>"
			</p>
		{/if}

		{#each displayAirports as { icao, feeds } (icao)}
			<div
				class="border border-black/8 dark:border-white/8 bg-surface-card rounded-lg overflow-hidden"
			>
				<!-- Airport label -->
				<div
					class="px-4 py-2.5 border-b border-black/6 dark:border-white/6 flex items-baseline gap-3"
				>
					<span class="font-mono font-bold text-sm">{icao}</span>
					<span class="text-xs text-foreground/50"
						>{feeds[0]?.name.split(" ").slice(0, -1).join(" ")}</span
					>
					<span class="ml-auto text-xs text-foreground/70"
						>{feeds.length} {feeds.length === 1 ? "feed" : "feeds"}</span
					>
				</div>

				<!-- Feed rows -->
				{#each feeds as feed}
					{@const isActive = activeFeed === feed}
					<button
						class="w-full flex items-center gap-3 px-4 py-2.5 text-left
							border-b border-black/4 dark:border-white/4 last:border-b-0 transition-colors
							{isActive ? 'bg-yellow-400/10' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}"
						onclick={() => (activeFeed = isActive ? null : feed)}
					>
						<!-- colored type dot -->
						<span
							class="w-1.5 h-1.5 rounded-full shrink-0"
							style="background: {TYPE_DOT[feed.type]}"
						></span>

						<!-- feed name -->
						<span
							class="flex-1 text-sm {isActive
								? 'text-yellow-400'
								: 'text-foreground/70'} truncate"
						>
							{feed.name}
						</span>

						<!-- freq -->
						<span class="font-mono text-[11px] text-foreground/40 shrink-0"
							>{feed.frequency}</span
						>

						<!-- type -->
						<span class="text-[11px] text-foreground/60 shrink-0 w-16 text-right"
							>{TYPE_LABEL[feed.type]}</span
						>
					</button>
				{/each}
			</div>
		{/each}
	</div>
</main>

<!-- Sticky bottom player -->
{#if activeFeed}
	{#key activeFeed}
		<div
			class="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 dark:border-white/10 bg-surface-player/95 backdrop-blur-sm rounded-t-xl"
		>
			<div class="max-w-4xl mx-auto px-4">
				<Stream feed={activeFeed} onclose={() => (activeFeed = null)} />
			</div>
		</div>
		<!-- Spacer so content isn't hidden behind fixed player -->
		<div class="h-28"></div>
	{/key}
{/if}
