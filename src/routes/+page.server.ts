import type { PageServerLoad } from "./atc/$types";

export const load = (async (event) => {
	const url = event.url;
	const search = url.search;
	try {
		const response = await fetch(`https://www.liveatc.net/topfeeds.php`);
		const text = await response.text();

		return {
			html: text,
			error: false,
		};
	} catch (error: any) {
		return {
			html: "",
			message: error.toString(),
			error: true,
		};
	}
}) satisfies PageServerLoad;
