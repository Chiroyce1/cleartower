export let sharedCtx: AudioContext | null = null;
export const capturedElements = new WeakMap<
	HTMLAudioElement,
	{ source: MediaElementAudioSourceNode; analyser: AnalyserNode }
>();

export function getOrCreateConnection(el: HTMLAudioElement): AnalyserNode | null {
	if (typeof window === "undefined" || typeof AudioContext === "undefined") {
		return null;
	}
	if (!sharedCtx || sharedCtx.state === "closed") {
		sharedCtx = new AudioContext();
	}
	if (sharedCtx.state === "suspended") {
		sharedCtx.resume().catch(() => {});
	}
	const existing = capturedElements.get(el);
	if (existing) return existing.analyser;
	try {
		const source = sharedCtx.createMediaElementSource(el);
		const analyser = sharedCtx.createAnalyser();
		analyser.fftSize = 1024;
		analyser.smoothingTimeConstant = 0.8;
		
		// Configure decibels range to naturally limit clipping
		analyser.minDecibels = -90;
		analyser.maxDecibels = -10;

		source.connect(analyser);
		analyser.connect(sharedCtx.destination);
		capturedElements.set(el, { source, analyser });
		return analyser;
	} catch (e) {
		console.warn("Failed to connect AudioContext:", e);
		return null;
	}
}
