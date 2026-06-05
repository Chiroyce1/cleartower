<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Play, Pause, X } from "lucide-svelte";
	import type { AtcFeed } from "$lib/feeds";
	import Waveform from "./Waveform.svelte";

	let { feed, onclose }: { feed: AtcFeed; onclose?: () => void } = $props();

	let audioEl = $state<HTMLAudioElement | null>(null);
	let isPlaying = $state(false);
	let hasError = $state(false);
	let elapsed = $state(0);
	let elapsedTimer: ReturnType<typeof setInterval>;

	$effect(() => {
		if (!audioEl) return;
		if (isPlaying) {
			audioEl.play().catch(() => {
				hasError = true;
				isPlaying = false;
			});
		} else {
			audioEl.pause();
		}
	});

	function toggle() {
		if (!isPlaying) elapsed = 0;
		isPlaying = !isPlaying;
		hasError = false;
	}

	onMount(() => {
		audioEl = document.getElementById("atc-player") as HTMLAudioElement;
		elapsedTimer = setInterval(() => {
			if (isPlaying) elapsed++;
		}, 1000);
	});
	onDestroy(() => {
		clearInterval(elapsedTimer);
		audioEl?.pause();
	});
</script>

<audio id="atc-player" src={feed.streamUrl} crossorigin="anonymous"></audio>

<div class="flex items-center gap-2 sm:gap-3 py-3 px-1 h-[70px]">
	<!-- Play/pause -->
	<button
		onclick={toggle}
		class="shrink-0 w-9 h-9 flex items-center justify-center rounded-md border transition-colors
			{isPlaying
			? 'bg-yellow-400 border-yellow-400 text-black'
			: 'border-foreground/15 text-foreground/70 hover:border-yellow-400/50 hover:text-yellow-400'}"
		aria-label={isPlaying ? "Pause" : "Play"}
	>
		{#if isPlaying}
			<Pause class="w-4 h-4" />
		{:else}
			<Play class="w-4 h-4 translate-x-px" />
		{/if}
	</button>

	<!-- Feed info -->
	<div class="flex flex-col min-w-0 w-28 xs:w-36 sm:w-44 shrink-0">
		<div class="flex items-center gap-1.5 min-w-0">
			{#if isPlaying}
				<span class="relative flex h-1.5 w-1.5 shrink-0">
					<span
						class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"
					></span>
					<span
						class="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-400"
					></span>
				</span>
			{/if}
			<span class="text-xs sm:text-sm font-medium truncate"
				>{feed.name}</span
			>
		</div>
		<span class="text-[10px] sm:text-[11px] text-foreground/50 font-mono">
			{feed.icao} · {feed.frequency}
		</span>
		{#if hasError}
			<span class="text-[10px] sm:text-[11px] text-red-400"
				>stream unavailable</span
			>
		{/if}
	</div>

	<!-- Waveform fills remaining space -->
	<div class="flex-1 h-11 min-w-0">
		<Waveform audioElement={audioEl} active={isPlaying} />
	</div>

	<button
		onclick={onclose}
		class="shrink-0 text-foreground/25 hover:text-foreground/70 transition-colors ml-1"
		aria-label="Close player"
	>
		<X class="w-4 h-4" />
	</button>
</div>
