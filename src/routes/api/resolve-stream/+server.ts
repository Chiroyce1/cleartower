import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
	const mount = url.searchParams.get("mount")?.trim();

	if (!mount) {
		return json(
			{ error: true, message: "mount parameter is required" },
			{ status: 400 },
		);
	}

	const targetUrl = `https://d.liveatc.net/${mount}`;

	try {
		const response = await fetch(targetUrl, {
			method: "HEAD",
			redirect: "manual",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
		});

		if (response.status === 302 || response.status === 301) {
			const location = response.headers.get("location");
			if (location) {
				return json({ error: false, streamUrl: location });
			}
		}

		// Fallback if no redirect or different status
		return json({ error: false, streamUrl: targetUrl });
	} catch (e: any) {
		return json(
			{ error: true, message: e.message || "Failed to resolve stream URL" },
			{ status: 500 },
		);
	}
};
