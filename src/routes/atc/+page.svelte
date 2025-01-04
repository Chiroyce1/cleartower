<script lang="ts">
	import { onMount } from "svelte";
	import type { PageData } from "./$types";
	import { Play, Pause, Volume2 } from "lucide-svelte";

	let audio: HTMLAudioElement | null = $state(null);
	let currentTime = $state(0);

	setInterval(() => {
		if (audio) {
			currentTime = document.querySelector("audio")?.currentTime || 0;
		}
	}, 1000);

	let { data }: { data: PageData } = $props();
	let metadata = $state({
		airport: "",
		atc: "",
		country: "",
		city: "",
		audioSrc: "",
	});

	const track = $state({
		albumArt: "/favicon.png",
		album: "Album",
		artist: "Artist",
		title: "Title",
		duration: 20,
	});

	setInterval(() => {
		track.duration = track.duration + 10;
	}, 10_000);

	let isPlaying = $state(false);

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	function parseText(text: string) {
		if (text.trim() === "")
			return { airport: "?", atc: "?", country: "?", city: "?" };
		// example:
		// "You are listening to: KJFK Clearance Delivery #2 - New York, New York, United States"
		// ATC should be `Clearance Delivery #2`
		// airport should be `KJFK`
		const location = text.split(" - ")[1].split(", ");
		let atc = text.split(":")[1].split(" ").slice(1).slice(1);
		let atcstr = atc.slice(0, atc.indexOf("-")).slice(0).join(" ");
		return {
			airport: text.split(":")[1].split(" ")[1],
			atc: atcstr,
			country: location[2],
			city: location[1],
		};
	}

	$effect(() => {
		const audio = document.querySelector("audio");
		if (!audio) return;
		if (isPlaying) {
			audio.play();
		} else {
			audio.pause();
		}
	});

	onMount(() => {
		if (data.error) {
			console.error(data.message);
		} else {
			// domparse `data.html`
			const parser = new DOMParser();
			const doc = parser.parseFromString(data.html, "text/html");
			// get first h1's textContent
			if (!doc.querySelector("h1")) {
				return;
			}
			const { airport, atc, country, city } = parseText(
				doc.querySelector("h1")?.textContent || ""
			);
			const audioSrc = doc.querySelector("audio")?.getAttribute("src") || "";
			metadata = { airport, atc, country, city, audioSrc };
			audio = document.querySelector("audio");

			console.log(metadata);
		}
	});
</script>

{#if data.error}
	<pre>{data.message}</pre>
{:else}
	<audio src={metadata.audioSrc}></audio>
	<div class="w-full max-w-2xl mx-auto p-6 rounded-xl bg-secondary my-8">
		<div class="flex space-x-4 mb-6 items-center">
			<button
				class="w-16 h-16 rounded-full bg-primary text-secondary flex items-center justify-center"
				onclick={() => {
					isPlaying = !isPlaying;
				}}
			>
				{#if isPlaying}
					<Pause class="w-6 h-6" />
				{:else}
					<Play class="w-6 h-6" />
				{/if}
			</button>
			<div class="flex-1">
				<h2 class="text-primary text-lg font-extrabold">{metadata.atc}</h2>
				<p class="text-primary font-regular">{metadata.airport}</p>
				<p class="text-primary text-sm font-light">{metadata.city}</p>
			</div>
			<div class="flex items-center gap-2">
				<Volume2 class="w-6 h-6 text-primary" />
				<input
					type="range"
					min="0"
					max="1"
					step="0.01"
					value={1}
					class="w-32 h-1 bg-primary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
					oninput={(e) => {
						if (audio) {
							// @ts-ignore
							audio.volume = parseFloat(e.target.value);
						}
					}}
				/>
			</div>
		</div>

		<div
			class="relative h-1 bg-primary rounded-full mb-4 cursor-not-allowed"
			title="Live Stream cannot be seeked"
		>
			{#if audio}
				<div
					class="absolute h-full bg-sky-600 rounded-full"
					style={`width: ${((currentTime || 0) / track.duration) * 100}%`}
				></div>
			{/if}
		</div>

		<div class="flex justify-between text-primary text-sm mb-6">
			{#if audio}
				{#if currentTime > 1}
					<span>{formatTime(currentTime)}</span>
				{:else if isPlaying}
					<span>Connecting ATC...</span>
				{:else}
					<span>Press play</span>
				{/if}
			{:else}
				<span>Loading...</span>
			{/if}
			<span>{formatTime(track.duration)}</span>
		</div>
	</div>
{/if}
