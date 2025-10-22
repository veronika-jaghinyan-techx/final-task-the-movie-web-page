import { AUTHORIZATION_TOKEN } from "./env.js";
import {
	getFlagImageUrl,
	isHTMLButtonElement,
	isHTMLElement,
} from "./utils.js";
import { Country } from "./types.js";

interface CountryResponse {
	english_name: string;
	iso_3166_1: string;
	native_name: string;
}

/**
 * Fetches the list of countries from TMDB configuration endpoint.
 * @returns A promise that resolves to an array of Country objects.
 */
async function getCountriesList(): Promise<Country[]> {
	const url =
		"https://api.themoviedb.org/3/configuration/countries?language=en-US";
	const options: RequestInit = {
		method: "GET",
		headers: {
			accept: "application/json",
			Authorization: `Bearer ${AUTHORIZATION_TOKEN}`,
		},
	};

	try {
		const response = await fetch(url, options);
		if (!response.ok)
			throw new Error(`Request failed with status ${response.status}`);
		const data: CountryResponse[] = await response.json();

		// Map API response to local Country type, fetching flag URL concurrently
		const countriesList = await Promise.all(
			data.map(async (c) => ({
				label: c.english_name,
				code: c.iso_3166_1,
				flag: (await getFlagImageUrl(c.iso_3166_1)) || "",
			}))
		);
		// Reverse the list based on the provided code logic
		return countriesList.reverse();
	} catch (error) {
		console.error("Error fetching countries:", error);
		return [];
	}
}

/**
 * Initializes the release dates filter section, including country selection and date pickers.
 */
export async function initReleaseDates() {
	const countriesList: Country[] = await getCountriesList();

	// --- Filter Toggle Elements ---
	const allReleasesCheckbox = document.getElementById(
		"all_releases"
	) as HTMLInputElement;
	const releaseTypeWrapper = document.getElementById(
		"release_type_wrapper"
	) as HTMLDivElement;
	const allCountriesCheckbox = document.getElementById(
		"all_release_countries"
	) as HTMLInputElement;
	const countrySelectWrapper = document.getElementById(
		"countrySelectWrapper"
	) as HTMLDivElement;
	const countrySelectContainer = document.getElementById(
		"countrySelect"
	) as HTMLDivElement;

	if (
		!isHTMLElement(releaseTypeWrapper) ||
		!isHTMLElement(countrySelectWrapper) ||
		!isHTMLElement(countrySelectContainer)
	) {
		return;
	}

	// Set initial visibility based on checkbox state
	if (allReleasesCheckbox?.checked) releaseTypeWrapper.classList.add("hide");
	if (allCountriesCheckbox?.checked) countrySelectWrapper.classList.add("hide");

	// Toggle event listeners
	allReleasesCheckbox?.addEventListener("change", () => {
		releaseTypeWrapper.classList.toggle("hide", allReleasesCheckbox.checked);
		// The value is used in getQueryParams in movies.ts
		allReleasesCheckbox.value = String(allReleasesCheckbox.checked);
	});

	allCountriesCheckbox?.addEventListener("change", () => {
		countrySelectWrapper.classList.toggle("hide", allCountriesCheckbox.checked);
	});

	// --- Country Select Dropdown ---
	const countrySelectButton = document.getElementById(
		"country-filter"
	) as HTMLButtonElement;
	const countrySelectOptionsList = document.getElementById(
		"countrySelectOptions"
	) as HTMLUListElement;

	if (
		!isHTMLButtonElement(countrySelectButton) ||
		!isHTMLElement(countrySelectOptionsList)
	) {
		return;
	}

	const countrySearchInput = countrySelectOptionsList.querySelector(
		".select-search-input"
	) as HTMLInputElement;
	const defaultCountryCode =
		countrySelectContainer.dataset.selectedCode || "AM";

	const setSelectedCountry = (code: string) => {
		const selected = countriesList.find((c) => c.code === code);
		if (!selected) return;

		const flagSpan = countrySelectButton.querySelector(
			".default-flag"
		) as HTMLSpanElement;
		const labelSpan = countrySelectButton.querySelector(
			".default-label"
		) as HTMLSpanElement;

		if (isHTMLElement(flagSpan)) {
			flagSpan.style.backgroundImage = `url('${selected.flag}')`;
		}

		if (isHTMLElement(labelSpan)) {
			labelSpan.textContent = selected.label;
		}

		countrySelectButton.dataset.value = selected.code;
		countrySelectContainer.dataset.selectedCode = selected.code;

		countrySelectOptionsList.querySelectorAll("li").forEach((li) => {
			li.classList.remove("selected");
			if (li.dataset.value === code) li.classList.add("selected");
		});
	};

	const populateCountrySelect = () => {
		const searchLi =
			countrySelectOptionsList.querySelector(".select-search-li");
		countriesList.forEach((c) => {
			const liEl = document.createElement("li");
			liEl.textContent = c.label;
			liEl.dataset.value = c.code;
			liEl.setAttribute("role", "option");
			liEl.style.display = "flex";
			liEl.style.alignItems = "center";

			const flagSpan = document.createElement("span");
			flagSpan.className = "dropdown_flag";
			flagSpan.style.backgroundImage = `url('${c.flag}')`;
			liEl.prepend(flagSpan);

			liEl.addEventListener("click", (e) => {
				e.stopPropagation();
				setSelectedCountry(liEl.dataset.value || "");
				countrySelectButton.click(); // Close the dropdown
			});

			if (searchLi) searchLi.insertAdjacentElement("afterend", liEl);
			else countrySelectOptionsList.appendChild(liEl);
		});

		setSelectedCountry(defaultCountryCode);
	};

	countrySelectButton.addEventListener("click", () => {
		const isExpanded =
			countrySelectButton.getAttribute("aria-expanded") === "true";
		countrySelectButton.setAttribute("aria-expanded", String(!isExpanded));
		countrySelectOptionsList.classList.toggle("hide", isExpanded);
		if (!isExpanded && countrySearchInput) countrySearchInput.focus();
	});

	countrySearchInput?.addEventListener("input", (e) => {
		const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
		countrySelectOptionsList
			.querySelectorAll("li:not(.select-search-li)")
			.forEach((li) => {
				const liText = li.textContent?.toLowerCase() || "";
				(li as HTMLLIElement).style.display = liText.includes(searchTerm)
					? "flex"
					: "none";
			});
	});

	populateCountrySelect();

	// --- Native Date Pickers ---
	const fromInput = document.getElementById("date_from") as HTMLInputElement;
	const toInput = document.getElementById("date_to") as HTMLInputElement;
	const fromBtn = fromInput?.nextElementSibling as HTMLButtonElement;
	const toBtn = toInput?.nextElementSibling as HTMLButtonElement;

	if (isHTMLButtonElement(fromBtn) && isHTMLButtonElement(toBtn)) {
		fromBtn.addEventListener("click", () => {
			if (fromInput.showPicker) fromInput.showPicker();
			else fromInput.focus();
		});

		toBtn.addEventListener("click", () => {
			if (toInput.showPicker) toInput.showPicker();
			else toInput.focus();
		});
	}
}
