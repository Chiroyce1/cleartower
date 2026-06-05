<script lang="ts">
	import { Radio, Sun, Moon, Github, GithubIcon } from "lucide-svelte";
	import { theme } from "$lib/theme";

	let isDark = $state(theme.current === "dark");

	function toggleTheme() {
		theme.toggle();
		isDark = theme.current === "dark";
	}
</script>

<nav
	class="flex items-center justify-between py-4 border-b border-black/10 dark:border-white/8"
>
	<a href="/" class="flex items-center gap-1 group">
		<Radio class="w-6 h-6 text-yellow-400" />
		<span class="font-semibold text-xl tracking-tight">
			C<span class="text-yellow-400">T</span>
		</span>
	</a>
	<div class="flex items-center gap-3">
		<span class="text-[11px] font-mono text-foreground/60"
			><a href="https://liveatc.net/" target="_blank">
				<b class="hover:underline">liveatc.net</b></a
			></span
		>
		⋅
		<span class="text-[11px] font-mono text-foreground/60"
			><a href="https://github.com/chiroyce1/cleartower" target="_blank">
				<b class="hover:underline">github</b></a
			></span
		>
		⋅
		<button
			onclick={toggleTheme}
			class="text-foreground/60 hover:text-foreground/80 transition-colors"
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
		>
			{#if isDark}
				<Sun class="w-4 h-4" />
			{:else}
				<Moon class="w-4 h-4" />
			{/if}
		</button>
	</div>
</nav>
