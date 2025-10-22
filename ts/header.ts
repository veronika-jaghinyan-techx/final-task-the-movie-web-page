import { isHTMLElement } from "./utils.js";

export function initHeader() {
	const header = document.querySelector(".header");
	let lastScrollTop = 0;

	if (!isHTMLElement(header)) return;

	const loader = document.getElementById("loader") as HTMLElement;

	window.addEventListener("scroll", () => {
		const scrollTop = window.scrollY || document.documentElement.scrollTop;
		if (scrollTop > lastScrollTop) {
			header.style.transform = "translateY(-4rem)";
			loader.style.top = "0";
		} else {
			header.style.transform = "translateY(0)";
			loader.style.top = "4rem";
		}

		lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
	});

	// 1. Dropdown menus on hover
	const dropdownButtons =
		document.querySelectorAll<HTMLButtonElement>("[data-dropdown]");
	dropdownButtons.forEach((button) => {
		const menuId = button.getAttribute("aria-controls");
		if (!menuId) return;

		const menu = document.getElementById(menuId);
		if (!isHTMLElement(menu)) return;

		const parent = button.parentElement;
		if (!isHTMLElement(parent)) return;

		parent.addEventListener("mouseenter", () => {
			menu.classList.remove("hide");
			button.setAttribute("aria-expanded", "true");
		});

		parent.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				menu.classList.remove("hide");
				button.setAttribute("aria-expanded", "true");
			}
		});

		parent.addEventListener("mouseleave", () => {
			menu.classList.add("hide");
			button.setAttribute("aria-expanded", "false");
		});

		// Close dropdown on outside click
		document.addEventListener("click", (e: MouseEvent) => {
			if (!parent.contains(e.target as Node)) {
				menu.classList.add("hide");
				button.setAttribute("aria-expanded", "false");
			}
		});
	});

	// 2 & 3. Popovers (Add & Language)
	const popoverButtons =
		document.querySelectorAll<HTMLButtonElement>("[data-popover]");
	popoverButtons.forEach((button) => {
		const popoverId = `popover-${button.dataset.popover}`;
		let popover = document.getElementById(popoverId);

		if (!popover) return;

		button.addEventListener("click", (e: MouseEvent) => {
			e.stopPropagation();
			// Close all popovers
			document
				.querySelectorAll<HTMLElement>(".popover")
				.forEach((p) => p.classList.add("hide"));
			popover.classList.remove("hide");
		});
	});

	// 4. Full-width search toggle
	const searchButtons: NodeListOf<HTMLButtonElement> =
		document.querySelectorAll("[data-search-toggle]");

	searchButtons.forEach((button) => {
		const searchIcon = button.querySelector<HTMLImageElement>(".search-icon");
		if (!searchIcon) return;

		// Toggle on button click
		button.addEventListener("click", (e) => {
			e.stopPropagation(); // prevent document click from firing immediately
			const nav = button.closest<HTMLElement>("[data-header-nav]");

			if (!isHTMLElement(nav)) return;

			const searchWrapper = nav.querySelector<HTMLElement>(
				".header-search-wrapper"
			);

			if (!isHTMLElement(searchWrapper)) return;

			searchWrapper.classList.toggle("hide");
			const isHidden = searchWrapper.classList.contains("hide");
			searchIcon.src = isHidden
				? "/assets/icons/search.svg"
				: "/assets/icons/close.svg";
		});

		// Close on outside click
		document.addEventListener("click", (e: MouseEvent) => {
			const target = e.target as Node;
			const nav = button.closest<HTMLElement>("[data-header-nav]");
			if (!isHTMLElement(nav)) return;

			const searchWrapper = nav.querySelector<HTMLElement>(
				".header-search-wrapper"
			);

			if (!isHTMLElement(searchWrapper)) return;
			if (!searchWrapper.contains(target) && !button.contains(target)) {
				searchWrapper.classList.add("hide");
				searchIcon.src = "/assets/icons/search.svg";
			}
		});
	});

	const searchInputs =
		document.querySelectorAll<HTMLInputElement>(".search-input");
	const searchResults = document.querySelectorAll<HTMLInputElement>(
		".header-search-result-section"
	);
	const searchForms =
		document.querySelectorAll<HTMLFormElement>(".search-form");

	searchForms.forEach((searchForm) =>
		searchForm.addEventListener("submit", (e: SubmitEvent) =>
			e.preventDefault()
		)
	);

	searchInputs.forEach((searchInput) => {
		searchInput.addEventListener("input", () => {
			if (searchInput.value.trim() !== "") {
				searchResults.forEach((searchResult) =>
					searchResult.classList.remove("hide")
				);
			} else {
				searchResults.forEach((searchResult) =>
					searchResult.classList.add("hide")
				);
			}
		});
	});

	document.addEventListener("click", (e: MouseEvent) => {
		document.querySelectorAll<HTMLElement>(".popover").forEach((p) => {
			if (!p.contains(e.target as Node)) {
				p.classList.add("hide");
			}
		});
	});

	// 5. Burger Menu Toggle
	const burgerToggle =
		document.querySelector<HTMLButtonElement>("#burgerMenuButton");
	const headerMenuMobile =
		document.querySelector<HTMLButtonElement>("#headerMenuMobile");

	if (!isHTMLElement(burgerToggle) || !isHTMLElement(headerMenuMobile)) return;

	burgerToggle.addEventListener("click", () => {
		headerMenuMobile.classList.toggle("hide");

		const isHidden = headerMenuMobile.classList.contains("hide");
		headerMenuMobile.setAttribute("aria-hidden", String(isHidden));
		burgerToggle.setAttribute("aria-expanded", String(!isHidden));
	});

	document.addEventListener("click", (e: MouseEvent) => {
		const isHidden = headerMenuMobile.classList.contains("hide");
		if (
			!headerMenuMobile.contains(e.target as Node) &&
			!burgerToggle.contains(e.target as Node) &&
			!isHidden
		) {
			headerMenuMobile.classList.add("hide");
			headerMenuMobile.setAttribute("aria-hidden", "true");
			burgerToggle.setAttribute("aria-expanded", "false");
		}
	});

	// 6. Mobile Menu submenus on click
	const mobileMenuButtons =
		document.querySelectorAll<HTMLButtonElement>("[data-menu-button]");
	mobileMenuButtons.forEach((button) => {
		const menuId = button.getAttribute("aria-controls");
		if (!menuId) return;

		const menu = document.getElementById(menuId);
		if (!isHTMLElement(menu)) return;

		if (!isHTMLElement(button)) return;

		button.addEventListener("click", () => {
			menu.classList.toggle("hide");

			const isHidden = menu.classList.contains("hide");
			menu.setAttribute("aria-hidden", String(isHidden));
			button.setAttribute("aria-expanded", String(!isHidden));
		});

		button.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				menu.classList.toggle("hide");

				const isHidden = menu.classList.contains("hide");
				menu.setAttribute("aria-hidden", String(isHidden));
				button.setAttribute("aria-expanded", String(!isHidden));
			}
		});
	});
}
