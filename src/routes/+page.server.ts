import { ATC_FEEDS } from "$lib/feeds";
import type { PageServerLoad } from "./$types";

const PRESETS = ["KJFK", "KLAX", "KSFO"];

export const load = (() => {
	return {
		presets: PRESETS.map((icao) => ({
			icao,
			feeds: ATC_FEEDS[icao] ?? [],
		})),
	};
}) satisfies PageServerLoad;
