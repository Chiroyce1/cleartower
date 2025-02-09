<script lang="ts">
	import Theme from "./Theme.svelte";
	import { Button } from "./ui/button";
</script>

<div class="w-full flex flex-row items-center justify-between pt-2">
	<h1 class="text-xl font-extrabold lg:text-3xl ml-1 lg:ml-3">
		<a href="/" class="text-theme gradient">ClearTower 🛩️</a>
	</h1>
	<div class="self-end flex gap-2">
		<a href="/history" class="text-sm" title="history">
			<Button
				class="text-md font-bold text-sky-400"
				variant="link"
				href="https://www.liveatc.net/topfeeds.php"
				target="_blank">LiveATC.net</Button
			>
		</a>

		<span class="sm:ml-2"><Theme /></span>
	</div>
</div>
