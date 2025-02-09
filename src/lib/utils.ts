import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export interface TableRow {
	listeners: string;
	feedDescription: string;
	city: string;
	stateProvince: string | null;
	country: string;
	atc: string;
	icao: string;
}

export function parseTableData(html: string): TableRow[] {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	const table = doc.querySelector("table.topTable");
	if (!table) {
		return [];
	}
	const rows = Array.from(table.querySelectorAll("tr"));
	// Skip the header row
	const dataRows = rows.slice(1);
	const extractedData: TableRow[] = [];

	dataRows.forEach((row) => {
		const cells = Array.from(row.querySelectorAll("td"));
		if (cells.length === 7) {
			const listenersElement = cells[1].querySelector('font[color="green"] i');
			const descriptionLink = cells[2].querySelector("a");
			const cityElement = cells[3].firstChild;
			const stateProvinceElement = cells[4].firstChild;
			const countryElement = cells[5].firstChild;
			const tuneInLink = cells[6].querySelector("a");

			let listeners = listenersElement ? listenersElement.textContent : "";
			let feedDescription = descriptionLink ? descriptionLink.textContent : "";
			let city = cityElement ? cityElement.textContent : "";
			let stateProvince = stateProvinceElement
				? stateProvinceElement.textContent
				: "";
			let country = countryElement ? countryElement.textContent : "";
			let atc = "";
			let icao = "";

			if (tuneInLink) {
				const onclick = tuneInLink.getAttribute("onclick");
				if (onclick) {
					const onclickParts = onclick.split("'");
					if (onclickParts.length >= 4) {
						atc = onclickParts[1];
						icao = onclickParts[3];
					}
				}
			}

			extractedData.push({
				listeners: listeners || "(?)",
				feedDescription: feedDescription || "(?)",
				city: city || "(?)",
				stateProvince: stateProvince,
				country: country || "(?)",
				atc: atc,
				icao: icao,
			});
		}
	});
	return extractedData;
}

export const flags = {
	Afghanistan: "🇦🇫",
	Albania: "🇦🇱",
	Algeria: "🇩🇿",
	Argentina: "🇦🇷",
	Australia: "🇦🇺",
	Bangladesh: "🇧🇩",
	Belgium: "🇧🇪",
	Brazil: "🇧🇷",
	Canada: "🇨🇦",
	China: "🇨🇳",
	Denmark: "🇩🇰",
	Egypt: "🇪🇬",
	France: "🇫🇷",
	Germany: "🇩🇪",
	India: "🇮🇳",
	Indonesia: "🇮🇩",
	Italy: "🇮🇹",
	Japan: "🇯🇵",
	Mexico: "🇲🇽",
	Netherlands: "🇳🇱",
	"New Zealand": "🇳🇿",
	Nigeria: "🇳🇬",
	Norway: "🇳🇴",
	Pakistan: "🇵🇰",
	Philippines: "🇵🇭",
	Poland: "🇵🇱",
	Portugal: "🇵🇹",
	Russia: "🇷🇺",
	"Saudi Arabia": "🇸🇦",
	"South Africa": "🇿🇦",
	"South Korea": "🇰🇷",
	Spain: "🇪🇸",
	Sweden: "🇸🇪",
	Switzerland: "🇨🇭",
	Turkey: "🇹🇷",
	"United Arab Emirates": "🇦🇪",
	"United Kingdom": "🇬🇧",
	"United States": "🇺🇸",
	"Hong Kong": "🇭🇰",
	"Costa Rica": "🇨🇷",
	Chile: "🇨🇱",
	Ireland: "🇮🇪",
	Malaysia: "🇲🇾",
	Hungary: "🇭🇺",
	Singapore: "🇸🇬",
};
