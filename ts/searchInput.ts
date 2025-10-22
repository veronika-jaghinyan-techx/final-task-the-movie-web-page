import { AUTHORIZATION_TOKEN } from "./env.js";
import { debounce } from "./utils.js";
import { Keyword, KeywordApiResponse } from "./types.js";

const API_URL = "https://api.themoviedb.org/3/search/keyword";
const DEBOUNCE_DELAY = 300;

// Store keywords globally for deduplication and form submission
let selectedKeywords: Keyword[] = [];

const fetchKeywords = async (query: string): Promise<void> => {
	const resultsDropdown = document.getElementById(
		"resultsDropdown"
	) as HTMLUListElement | null;
	if (!resultsDropdown || !query.trim()) {
		resultsDropdown?.replaceChildren();
		resultsDropdown?.classList.remove("show");
		return;
	}

	const loadingLi = document.createElement("li");
	loadingLi.className = "loading-indicator";
	loadingLi.textContent = "Loading...";
	resultsDropdown.replaceChildren(loadingLi);
	resultsDropdown.classList.add("show");

	const url = `${API_URL}?query=${encodeURIComponent(query)}`;

	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${AUTHORIZATION_TOKEN}`,
				Accept: "application/json",
			},
		});
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

		const data: KeywordApiResponse = await response.json();
		displayResults(data.results || []);
	} catch (error) {
		console.error("Fetch error:", error);
		const errorLi = document.createElement("li");
		errorLi.className = "loading-indicator";
		errorLi.style.color = "var(--red)";
		errorLi.textContent = "Error fetching data.";
		resultsDropdown.appendChild(errorLi);
	}
};

const displayResults = (results: Keyword[]): void => {
	const resultsDropdown = document.getElementById(
		"resultsDropdown"
	) as HTMLUListElement | null;
	const inputElement = document.getElementById(
		"keywordSearch"
	) as HTMLInputElement | null;
	if (!resultsDropdown || !inputElement) return;

	resultsDropdown.replaceChildren();

	// Filter out keywords already selected
	const uniqueResults = results.filter(
		(item) => !selectedKeywords.some((kw) => kw.id === item.id)
	);

	if (uniqueResults.length === 0) {
		const noResultsLi = document.createElement("li");
		noResultsLi.className = "loading-indicator";
		noResultsLi.textContent = "No new results found.";
		resultsDropdown.appendChild(noResultsLi);

		if (inputElement.value.trim()) resultsDropdown.classList.add("show");
		else resultsDropdown.classList.remove("show");
		return;
	}

	uniqueResults.forEach((item) => {
		const li = document.createElement("li");
		li.textContent = item.name;
		li.dataset.id = String(item.id);
		li.addEventListener("click", () => {
			addBadge(item);
			resultsDropdown.classList.remove("show");
			inputElement.value = "";
		});
		resultsDropdown.appendChild(li);
	});

	resultsDropdown.classList.add("show");
};

const addBadge = (keyword: Keyword): void => {
	const badgeArea = document.getElementById(
		"badgeArea"
	) as HTMLDivElement | null;
	const inputElement = document.getElementById(
		"keywordSearch"
	) as HTMLInputElement | null;
	if (
		!badgeArea ||
		!inputElement ||
		selectedKeywords.some((kw) => kw.id === keyword.id)
	)
		return;

	selectedKeywords.push(keyword);

	const badge = document.createElement("span");
	badge.className = "badge";
	badge.dataset.id = String(keyword.id);

	const textNode = document.createTextNode(keyword.name);
	const closeBtn = document.createElement("span");
	closeBtn.className = "badge-close";
	closeBtn.textContent = "×";

	closeBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		removeBadge(keyword.id, badge);
	});

	badge.appendChild(textNode);
	badge.appendChild(closeBtn);

	// Insert the badge before the input field in the badge area
	badgeArea.insertBefore(badge, inputElement);

	// After adding a badge, refresh the search results for the current input value
	if (inputElement.value) fetchKeywords(inputElement.value);
};

const removeBadge = (id: number, badgeElement: HTMLElement): void => {
	const inputElement = document.getElementById(
		"keywordSearch"
	) as HTMLInputElement | null;

	selectedKeywords = selectedKeywords.filter((kw) => kw.id !== id);
	badgeElement.remove();

	const resultsDropdown = document.getElementById(
		"resultsDropdown"
	) as HTMLUListElement | null;
	if (inputElement && inputElement.value) fetchKeywords(inputElement.value);
	else resultsDropdown?.classList.remove("show");
};

/**
 * Initializes keyword search functionality, including debounced fetching and badge management.
 */
export function initSearchInput(): void {
	const inputElement = document.getElementById(
		"keywordSearch"
	) as HTMLInputElement | null;
	const resultsDropdown = document.getElementById(
		"resultsDropdown"
	) as HTMLUListElement | null;
	const badgeArea = document.getElementById(
		"badgeArea"
	) as HTMLDivElement | null;

	if (!inputElement || !resultsDropdown || !badgeArea) {
		console.error(
			"Required DOM elements were not found. Search input not initialized."
		);
		return;
	}

	const debouncedSearchHandler = debounce((event: Event) => {
		const target = event.target as HTMLInputElement;
		fetchKeywords(target.value);
	}, DEBOUNCE_DELAY);

	inputElement.addEventListener("input", debouncedSearchHandler);

	// Close dropdown on outside click
	document.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as Node;
		if (!badgeArea.contains(target) && !resultsDropdown.contains(target)) {
			resultsDropdown.classList.remove("show");
		}
	});

	// Re-show dropdown on focus if there are results or text
	inputElement.addEventListener("focus", () => {
		if (
			resultsDropdown.children.length > 0 ||
			inputElement.value.trim().length > 0
		) {
			resultsDropdown.classList.add("show");
		}
	});
}
