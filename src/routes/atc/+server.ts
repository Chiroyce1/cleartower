import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ATC_FEEDS } from "$lib/feeds";

/**
 * GET /atc?mount=kjfk_twr&icao=KJFK
 *
 * Returns feed info from the local static database.
 * No longer proxies liveatc.net — all data is hardcoded.
 */
export const GET: RequestHandler = async (event) => {
	const mount = event.url.searchParams.get("mount");
	const icao = event.url.searchParams.get("icao")?.toUpperCase();

	if (!mount && !icao) {
		return json({ error: true, message: "mount or icao required" }, { status: 400 });
	}

	const airportFeeds = icao ? ATC_FEEDS[icao] ?? [] : [];
	const feed = mount
		? Object.values(ATC_FEEDS)
				.flat()
				.find((f) => f.mountPoint === mount)
		: airportFeeds[0];

	if (!feed) {
		return json({ error: true, message: "Feed not found" }, { status: 404 });
	}

	return json({ error: false, feed });
};
