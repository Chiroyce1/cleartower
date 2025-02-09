<script lang="ts">
	import { cn } from "$lib/utils";
	import {
		Heart,
		Shuffle,
		SkipBack,
		Play,
		Pause,
		SkipForward,
		Repeat,
		Menu,
	} from "lucide-svelte";

	const track = {
		albumArt: "/icon.png",
		album: "Album",
		artist: "Artist",
		title: "Title",
		duration: 180,
	};

	let isPlaying = $state(false);

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const currentTime = 42;
</script>

<div
	class="w-full max-w-2xl mx-auto p-6 rounded-xl bg-gradient-to-b from-gray-900/80 to-gray-900"
>
	<div class="flex items-start space-x-4 mb-6">
		<img
			src={track.albumArt}
			alt={`${track.album} cover`}
			class="w-16 h-16 rounded-sm"
		/>
		<div class="flex-1">
			<h2 class="text-white text-lg font-medium">{track.title}</h2>
			<p class="text-gray-400">{track.artist}</p>
			<p class="text-gray-500 text-sm">{track.album}</p>
		</div>
	</div>

	<div class="relative h-1 bg-gray-700 rounded-full mb-4 cursor-pointer">
		<div
			class="absolute h-full bg-blue-400 rounded-full"
			style={`width: ${(currentTime / track.duration) * 100}%`}
		></div>
	</div>

	<div class="flex justify-between text-gray-400 text-sm mb-6">
		<span>{formatTime(currentTime)}</span>
		<span>{formatTime(track.duration)}</span>
	</div>

	<div class="flex items-center justify-between">
		<button class="text-gray-400 hover:text-white transition-colors">
			<Heart class="w-6 h-6" />
		</button>
		<button class="text-gray-400 hover:text-white transition-colors">
			<Shuffle class="w-6 h-6" />
		</button>
		<button class="text-gray-400 hover:text-white transition-colors">
			<SkipBack class="w-6 h-6" />
		</button>
		<button
			class="w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-gray-200 transition-colors"
			onclick={() => (isPlaying = !isPlaying)}
		>
			<svelte:component this={isPlaying ? Pause : Play} class="w-6 h-6" />
		</button>
		<button class="text-gray-400 hover:text-white transition-colors">
			<SkipForward class="w-6 h-6" />
		</button>
		<button class="text-gray-400 hover:text-white transition-colors">
			<Repeat class="w-6 h-6" />
		</button>
		<button class="text-gray-400 hover:text-white transition-colors">
			<Menu class="w-6 h-6" />
		</button>
	</div>
</div>
