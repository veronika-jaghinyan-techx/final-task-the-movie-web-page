// --- Type Guards ---

// Checks if an element is a non-null HTMLElement
export const isHTMLElement = (el: Element | null): el is HTMLElement => {
	return el !== null && el instanceof HTMLElement;
};

// Checks if an element is a non-null HTMLButtonElement
export const isHTMLButtonElement = (
	el: Element | null
): el is HTMLButtonElement => {
	return el !== null && el instanceof HTMLButtonElement;
};

// --- Date & URL Formatting ---

/**
 * Formats a TMDB date string (YYYY-MM-DD) to a readable format (e.g., MMM D, YYYY).
 */
export function formatDate(dateString: string): string {
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return "";

		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return "";
	}
}

/**
 * Constructs a detail page URL with a slugified path.
 */
export function getSingleMovieUrl(id: number, name: string): string {
	const urlPath =
		id +
		"-" +
		name
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphen
			.replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens

	return "#" + urlPath;
}

/**
 * Retrieves the flag image URL using an external service.
 */
export function getFlagImageUrl(countryCode: string): string {
	const code = countryCode.toUpperCase();
	return `https://flagsapi.com/${code}/flat/64.png`;
}

// --- Slider Utilities ---

/**
 * Clamps a number between a minimum and maximum value.
 */
export const clamp = (num: number, min: number, max: number): number =>
	Math.max(min, Math.min(max, num));

/**
 * Converts a value within a range to a percentage (0-100).
 */
export const valueToPercent = (
	value: number,
	min: number,
	max: number
): number => (min === max ? 0 : ((value - min) / (max - min)) * 100);

/**
 * Converts a percentage (0-100) back to a stepped value within a range.
 */
export const percentToValue = (
	percent: number,
	min: number,
	max: number,
	step: number
): number => {
	const rawValue = min + (percent / 100) * (max - min);
	return clamp(Math.round(rawValue / step) * step, min, max);
};

// --- General Utilities ---

/**
 * Debounce function to limit how often a function is executed.
 */
export const debounce = <T extends (...args: any[]) => void>(
	callback: T,
	delay: number
): ((...args: Parameters<T>) => void) => {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => callback(...args), delay);
	};
};
