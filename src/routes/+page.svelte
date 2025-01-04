<script lang="ts">
	import { onMount } from "svelte";
	import type { PageData } from "./$types";
	import Button from "$lib/components/ui/button/button.svelte";

	let audio: HTMLAudioElement | null = $state(null);
	let currentTime = $state(0);

	type ATC = {
		atc: string;
		icao: string;
	};

	let { data }: { data: PageData } = $props();
	let onclicks: string[] | null = $state([]);
	let atcs: ATC[] = $state([]);

	onMount(() => {
		if (data.error) {
			console.error(data.message);
		} else {
			// domparse `data.html`
			const parser = new DOMParser();
			const doc = parser.parseFromString(data.html, "text/html");
			// get all a tags inside of <td>s
			const links = doc.querySelectorAll("td a");
			// get all their onclick attributes
			onclicks = Array.from(links)
				.map((link) => link.getAttribute("onclick"))
				.filter((onclick): onclick is string => onclick !== null)
				.slice(1);

			// every onclick is myHTML5Popup('atc', 'icao')
			// example
			// myHTML5Popup('kbos_twr', 'KBOS')
			// extract each of these
			atcs = onclicks.map((onclick) => {
				const atc = onclick.split("'")[1].split("'")[0];
				const icao = onclick.split("'")[3].split("'")[0];
				return { atc, icao };
			});
		}
	});
</script>

<div class="w-full max-w-4xl mx-auto p-6 rounded-xl my-8">
	{#if data.error}
		<p>{data.message}</p>
	{:else}
		<div class="atcs">
			{#each atcs as { atc, icao }}
				<Button
					variant="link"
					class="text-md font-light max-w-full border-secondary border-2"
					href={`/atc?mount=${atc}&icao=${icao}`}>{icao.toUpperCase()}</Button
				>
			{/each}
		</div>
	{/if}
</div>

<style>
	.atcs {
		display: grid;
		grid-gap: 10px;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		margin: 20px auto;
	}
</style>
