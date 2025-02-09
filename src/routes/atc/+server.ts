import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
	const url = event.url;
	const search = url.search;
	try {
		const response = await fetch(
			`https://www.liveatc.net/hlisten.php${search}`
		);
		const text = await response.text();

		return json({
			html: text,
			error: false,
		});
	} catch (error: any) {
		return json({
			html: "",
			message: error.toString(),
			error: true,
		});
	}
};
