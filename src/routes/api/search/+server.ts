import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ATC_FEEDS } from "$lib/feeds";

const ALL_AIRPORTS = Object.entries(ATC_FEEDS).map(([icao, feeds]) => ({ icao, feeds }));

export const GET: RequestHandler = ({ url }) => {
	const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

	if (!q || q.length < 2) {
		return json({ airports: [] });
	}

	const results = ALL_AIRPORTS.filter(({ icao, feeds }) => {
		return (
			icao.toLowerCase().includes(q) ||
			feeds.some((f) => f.name.toLowerCase().includes(q))
		);
	}).slice(0, 20); // cap results

	return json({ airports: results });
};
