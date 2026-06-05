import { browser } from "$app/environment";

const STORAGE_KEY = "ct-theme";

function createTheme() {
	// Initialise from localStorage, fallback to dark
	const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
	let current = (stored === "light" ? "light" : "dark") as "dark" | "light";

	function apply(theme: "dark" | "light") {
		if (!browser) return;
		document.documentElement.classList.toggle("dark", theme === "dark");
		document.documentElement.classList.toggle("light", theme === "light");
		localStorage.setItem(STORAGE_KEY, theme);
	}

	// Apply on load
	apply(current);

	return {
		get current() {
			return current;
		},
		toggle() {
			current = current === "dark" ? "light" : "dark";
			apply(current);
		},
	};
}

export const theme = createTheme();
