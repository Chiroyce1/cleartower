<script lang="ts">
	import * as Table from "$lib/components/ui/table/index.js";
	import { onMount } from "svelte";
	import type { PageData } from "./$types";
	import type { TableRow } from "$lib/utils";
	import { parseTableData, flags } from "$lib/utils";
	import Button from "$lib/components/ui/button/button.svelte";
	import Stream from "$lib/components/Stream.svelte";
	import { Pause, Play } from "lucide-svelte";

	let { data }: { data: PageData } = $props();
	let streams: TableRow[] = $state([]);
	let identifier: string = $state("");

	let selected: TableRow | null = $state(null);

	onMount(() => {
		if (data.error) {
			console.error(data.message);
		} else {
			streams = parseTableData(data.html);
		}
	});
</script>

<div class="w-full max-w-5xl lg:mx-auto p-2 lg:p-6 rounded-xl my-8">
	{#if selected}
		{#key selected}
			<Stream atc={selected} />
		{/key}
	{:else}
		<p class="text-4xl font-bold text-center mb-4">
			Top 50 streams from LiveATC
		</p>
	{/if}

	{#if data.error}
		<p>{data.message}</p>
	{:else}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[10px]">Play</Table.Head>
					<Table.Head class="w-[300px]">Feed Description</Table.Head>
					<Table.Head>City</Table.Head>
					<Table.Head>Listeners</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body class="max-h-18 overflow-y-scroll">
				{#each streams as stream}
					<Table.Row>
						<Table.Cell
							><Button
								variant="ghost"
								onclick={async () => {
									selected = stream;
								}}
							>
								{#if selected === stream}
									<Pause class="w-6 h-6" />
								{:else}
									<Play class="w-6 h-6" />
								{/if}
							</Button></Table.Cell
						>
						<Table.Cell
							class="text-md lg:text-md font-medium flex items-center gap-2"
						>
							<span class="text-md lg:text-3xl"
								>{flags[stream.country as keyof typeof flags] || ""}</span
							>
							{stream.feedDescription}</Table.Cell
						>
						<Table.Cell
							>{stream.city}{#if stream.stateProvince}, {stream.stateProvince}
							{/if}, {stream.country}
						</Table.Cell>
						<Table.Cell align="right">{stream.listeners}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}
</div>
