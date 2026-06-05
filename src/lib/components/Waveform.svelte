<!-- 
Transpiled from React to Svelte from https://github.com/kewonit/aeris (AGPLv3)
Source: https://github.com/kewonit/aeris/blob/main/src/components/ui/atc-waveform.tsx
-->

<script lang="ts">
	import { onMount } from "svelte";
	import { getOrCreateConnection, sharedCtx } from "$lib/audioContext";

	let {
		audioElement,
		active,
	}: { audioElement: HTMLAudioElement | null; active: boolean } = $props();

	const DEFAULT_BAR_COUNT = 128;
	const BAR_WIDTH = 2;
	const BAR_GAP = 1;
	const MIN_BAR_H = 0.1;
	const LERP = 0.22;
	const SENSITIVITY = 0.9; // Multiplier to adjust signal sensitivity
	const POWER = 2.8; // Exponent to keep quiet/mid volumes low and preserve resolution
	const HEIGHT_SCALE = 2; // Multiplier to let loud peaks fill the physical div height

	let canvas: HTMLCanvasElement;
	let analyser = $state<AnalyserNode | null>(null);
	let bars: number[] = new Array(DEFAULT_BAR_COUNT).fill(0);

	let layout = {
		w: DEFAULT_BAR_COUNT * BAR_WIDTH + (DEFAULT_BAR_COUNT - 1) * BAR_GAP,
		h: 28,
		barCount: DEFAULT_BAR_COUNT,
		barWidth: BAR_WIDTH,
		barGap: BAR_GAP,
	};

	function buildBinRanges(
		binCount: number,
		barCount: number,
		sampleRate: number,
	): [number, number][] {
		// ATC audio is band-limited narrow-band voice (300–3,400 Hz).
		// We use logarithmic spacing so each bar spans a perceptually equal
		// frequency interval. This means high-freq bars cover wider Hz ranges,
		// averaging more FFT bins and producing a visible bar instead of silence.
		const startFreq = 300;
		const endFreq = 3400;
		const hzPerBin = sampleRate / (2 * binCount);
		const logStart = Math.log(startFreq);
		const logEnd = Math.log(endFreq);

		const ranges: [number, number][] = [];
		for (let i = 0; i < barCount; i++) {
			const freqLo = Math.exp(logStart + (logEnd - logStart) * (i / barCount));
			const freqHi = Math.exp(
				logStart + (logEnd - logStart) * ((i + 1) / barCount),
			);
			const binLo = Math.max(1, Math.floor(freqLo / hzPerBin));
			const binHi = Math.min(binCount - 1, Math.ceil(freqHi / hzPerBin));
			ranges.push([binLo, Math.max(binHi, binLo + 1)]);
		}
		return ranges;
	}

	$effect(() => {
		if (!active || !audioElement) {
			bars = new Array(layout.barCount).fill(0);
			analyser = null;
			return;
		}

		analyser = getOrCreateConnection(audioElement);

		// Resume AudioContext when tab returns from background.
		function onVisibilityResume() {
			if (
				document.visibilityState === "visible" &&
				sharedCtx?.state === "suspended"
			) {
				sharedCtx.resume().catch(() => {});
			}
		}
		document.addEventListener("visibilitychange", onVisibilityResume);

		return () => {
			document.removeEventListener("visibilitychange", onVisibilityResume);
		};
	});

	onMount(() => {
		const draw2d = canvas.getContext("2d");
		if (!draw2d) return;

		/** Recompute canvas backing-store size from CSS dimensions. */
		function syncCanvasSize() {
			if (!canvas || !draw2d) return;
			const rect = canvas.getBoundingClientRect();
			const w = rect.width;
			const h = rect.height;
			if (w < 1 || h < 1) return;

			const barCount = Math.min(DEFAULT_BAR_COUNT, Math.max(16, Math.floor(w / (BAR_WIDTH + BAR_GAP))));

			// Calculate gap and barWidth dynamically to fit w perfectly without clipping
			const gap = Math.max(0.05, Math.min(BAR_GAP, w / (barCount * 3)));
			const barWidth = (w - (barCount - 1) * gap) / barCount;

			layout = { w, h, barCount, barWidth, barGap: gap };

			// Resize bars array when count changes
			if (bars.length !== barCount) {
				bars = new Array(barCount).fill(0);
			}

			const dpr = window.devicePixelRatio || 1;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			draw2d.setTransform(dpr, 0, 0, dpr, 0, 0);
		}

		syncCanvasSize();

		const ro = new ResizeObserver(() => syncCanvasSize());
		ro.observe(canvas);

		// Hoist allocations out of draw loop - only reallocate when binCount changes
		let dataArray: Uint8Array<ArrayBuffer> | null = null;
		let binRanges: [number, number][] | null = null;
		let lastBinCount = 0;
		let lastBarCount = 0;
		let lastSampleRate = 0;
		let rafId = 0;

		function draw() {
			rafId = requestAnimationFrame(draw);

			const now = performance.now();
			const binCount = analyser?.frequencyBinCount ?? 128;
			const sampleRate = analyser?.context.sampleRate ?? 48000;
			const { w: cW, h: cH, barCount, barWidth, barGap } = layout;

			if (
				binCount !== lastBinCount ||
				barCount !== lastBarCount ||
				sampleRate !== lastSampleRate
			) {
				dataArray = new Uint8Array(binCount) as Uint8Array<ArrayBuffer>;
				binRanges = buildBinRanges(binCount, barCount, sampleRate);
				lastBinCount = binCount;
				lastBarCount = barCount;
				lastSampleRate = sampleRate;
			}
			if (analyser && dataArray) analyser.getByteFrequencyData(dataArray);

			draw2d!.clearRect(0, 0, cW, cH);

			// Compute theme once per frame (not per bar)
			const isDark = document.documentElement.classList.contains("dark");
			const idleFill = isDark
				? "rgba(255, 255, 255, 0.1)"
				: "rgba(0, 0, 0, 0.1)";

			for (let i = 0; i < barCount; i++) {
				// Average frequency bins in this bar's range
				const [startBin, endBin] = binRanges![i];
				let sum = 0;
				const count = endBin - startBin;
				for (let b = startBin; b < endBin; b++) {
					sum += dataArray![b];
				}
				const raw =
					analyser && count > 0 ? (sum / count / 255) * SENSITIVITY : 0;

				// Idle breathing: gentle sine wave per bar when no signal
				const breathPhase = (now / 1200 + i * 0.35) % (Math.PI * 2);
				const breathVal = 0.08 + Math.sin(breathPhase) * 0.05;
				const target = raw > 0.02 ? raw : breathVal;

				bars[i] = (bars[i] ?? 0) + (target - (bars[i] ?? 0)) * LERP;
				const val = bars[i];

				const compressed = Math.pow(Math.min(val, 1), POWER);
				const barH = Math.max(
					MIN_BAR_H,
					Math.min(cH - 2, compressed * (cH - 2) * HEIGHT_SCALE),
				);
				const x = i * (barWidth + barGap);
				const y = cH / 2 - barH / 2;

				// Yellow when signal, dim fill when idle
				if (raw > 0.04) {
					const intensity = Math.min(val * 1.6, 1);
					draw2d!.fillStyle = `rgba(250, 204, 21, ${0.5 + intensity * 0.5})`;
				} else {
					draw2d!.fillStyle = idleFill;
				}
				draw2d!.beginPath();
				if (barWidth < 1) {
					draw2d!.rect(x, y, barWidth, barH);
				} else {
					const radius = Math.max(0.5, Math.min(barWidth / 2, 4));
					draw2d!.roundRect(x, y, barWidth, barH, radius);
				}
				draw2d!.fill();
			}
		}

		draw();
		return () => {
			cancelAnimationFrame(rafId);
			ro.disconnect();
		};
	});
</script>

<canvas bind:this={canvas} class="w-full h-full" aria-hidden="true"></canvas>
