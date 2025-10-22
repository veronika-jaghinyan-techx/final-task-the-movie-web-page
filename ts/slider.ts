import { SLIDER_SELECTOR, TOOLTIP_CLASS } from "./constants.js";
import {
	clamp,
	percentToValue,
	valueToPercent,
	isHTMLElement,
} from "./utils.js";
import { SliderValues, Range } from "./types.js";

function createSharedTooltip(slider: HTMLElement): HTMLElement {
	let tooltip = slider.querySelector(`.${TOOLTIP_CLASS}`) as HTMLElement;
	if (tooltip) return tooltip;

	tooltip = document.createElement("div");
	tooltip.className = `${TOOLTIP_CLASS} k-popup k-rounded-md`;
	tooltip.style.cssText = `
        position: absolute;
        pointer-events: none;
        white-space: nowrap;
        visibility: hidden;
        z-index: 3;
        transform: translate(-50%, -100%);
        bottom: 10px;
    `;
	slider.appendChild(tooltip);
	return tooltip;
}

function initializeSingleSlider(slider: HTMLElement): void {
	const track = slider.querySelector(".k-slider-track") as HTMLElement;
	const selection = slider.querySelector(".k-slider-selection") as HTMLElement;
	const handles = slider.querySelectorAll(".k-draghandle");

	const isSingleHandle = handles.length === 1;
	const handleMin = !isSingleHandle ? (handles[0] as HTMLElement) : null;
	const handleMax = isSingleHandle
		? (handles[0] as HTMLElement)
		: (handles[1] as HTMLElement);

	const rangeContainer = slider.querySelector(
		".full_width.range[data-role]"
	) as HTMLElement;
	const inputs = rangeContainer ? rangeContainer.querySelectorAll("input") : [];
	const inputMin = inputs[0] as HTMLInputElement;
	const inputMax = inputs[1] as HTMLInputElement;

	if (!track || !selection || !handleMax || !inputMin || !inputMax) {
		return console.error("Required slider elements not found:", slider);
	}

	const sharedTooltip = createSharedTooltip(slider);

	const MIN_VALUE = parseInt(
		handleMax.getAttribute("aria-valuemin") || "0",
		10
	);
	const MAX_VALUE = parseInt(
		handleMax.getAttribute("aria-valuemax") || "10",
		10
	);
	const STEP = 1;

	let minVal: number = isSingleHandle
		? MIN_VALUE
		: parseInt(inputMin.value, 10) || MIN_VALUE;
	const initialMaxVal = parseInt(inputMax.value, 10);
	let maxVal: number = isNaN(initialMaxVal) ? MAX_VALUE : initialMaxVal;

	let activeHandle: "min" | "max" | null = null;
	let activeHandleElement: HTMLElement | null = null;

	if (isSingleHandle) selection.style.left = "0%";

	const updateUI = (): void => {
		const minPercent = isSingleHandle
			? 0
			: valueToPercent(minVal, MIN_VALUE, MAX_VALUE);
		const maxPercent = valueToPercent(maxVal, MIN_VALUE, MAX_VALUE);
		const selectionWidth = maxPercent - minPercent;
		selection.style.width = `${selectionWidth}%`;

		if (!isSingleHandle && handleMin) {
			selection.style.left = `${minPercent}%`;
			handleMin.style.left = `${minPercent}%`;
		}
		handleMax.style.left = `${maxPercent}%`;

		let ariaTextMin = "";
		let ariaTextMax = "";

		if (isSingleHandle) {
			ariaTextMax = maxVal.toString();
			inputMin.value = minVal.toString();
			inputMax.value = maxVal.toString();
		} else {
			const originalAriaText = handleMax.getAttribute("aria-valuetext");
			if (originalAriaText && originalAriaText.includes("minutes")) {
				ariaTextMin = `${minVal} minutes - ${maxVal} minutes`;
				ariaTextMax = ariaTextMin;
			} else {
				ariaTextMin = `Rated ${minVal} - ${maxVal}`;
				ariaTextMax = ariaTextMin;
			}
			inputMin.value = minVal.toString();
			inputMax.value = maxVal.toString();
		}

		if (!isSingleHandle && handleMin) {
			handleMin.setAttribute("aria-valuenow", minVal.toString());
			handleMin.setAttribute("aria-valuetext", ariaTextMin);
		}
		handleMax.setAttribute("aria-valuenow", maxVal.toString());
		handleMax.setAttribute("aria-valuetext", ariaTextMax);

		if (activeHandleElement) {
			const tooltipContent = activeHandleElement.getAttribute("aria-valuetext");
			sharedTooltip.textContent =
				tooltipContent ||
				(isSingleHandle ? maxVal.toString() : `${minVal} - ${maxVal}`);
			const positionPercent =
				activeHandle === "min" && handleMin ? minPercent : maxPercent;
			sharedTooltip.style.left = `${positionPercent}%`;
			sharedTooltip.style.visibility = "visible";
		} else {
			sharedTooltip.style.visibility = "hidden";
		}

		if (!isSingleHandle && handleMin) {
			const minIsFurtherRight = minPercent > 100 - maxPercent;
			handleMin.style.zIndex =
				activeHandle === "min" || minIsFurtherRight ? "1" : "0";
		}
		handleMax.style.zIndex =
			activeHandle === "max" || isSingleHandle ? "1" : "0";
	};

	const drag = (type: "min" | "max", e: MouseEvent | TouchEvent): void => {
		const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
		const trackRect = track.getBoundingClientRect();
		let percent = ((clientX - trackRect.left) / trackRect.width) * 100;
		percent = clamp(percent, 0, 100);

		let newValue = percentToValue(percent, MIN_VALUE, MAX_VALUE, STEP);

		if (type === "min" && !isSingleHandle && handleMin) {
			newValue = clamp(newValue, MIN_VALUE, maxVal);
			minVal = newValue;
		} else if (type === "max" || isSingleHandle) {
			newValue = clamp(newValue, minVal, MAX_VALUE);
			maxVal = newValue;
		}

		updateUI();
	};

	const startDrag = (type: "min" | "max", e: MouseEvent | TouchEvent): void => {
		if (type === "min" && (isSingleHandle || !handleMin)) return;

		e.preventDefault();
		activeHandle = type;
		activeHandleElement = type === "min" && handleMin ? handleMin : handleMax;

		if (!activeHandleElement) return;

		activeHandleElement.classList.add("k-pressed");
		updateUI();

		const onMove = (moveEvent: MouseEvent | TouchEvent) =>
			drag(type, moveEvent);
		const onEnd = () => {
			document.removeEventListener("mousemove", onMove);
			document.removeEventListener("mouseup", onEnd);
			document.removeEventListener("touchmove", onMove);
			document.removeEventListener("touchend", onEnd);

			if (activeHandleElement)
				activeHandleElement.classList.remove("k-pressed");
			activeHandle = null;
			activeHandleElement = null;
			updateUI();
		};

		document.addEventListener("mousemove", onMove);
		document.addEventListener("mouseup", onEnd);
		document.addEventListener("touchmove", onMove, { passive: false });
		document.addEventListener("touchend", onEnd);
	};

	if (!isSingleHandle && handleMin) {
		handleMin.addEventListener("mousedown", (e) => startDrag("min", e));
		handleMin.addEventListener("touchstart", (e) => startDrag("min", e));
	}
	handleMax.addEventListener("mousedown", (e) => startDrag("max", e));
	handleMax.addEventListener("touchstart", (e) => startDrag("max", e));

	updateUI();
}

/**
 * Initializes all slider components in the document.
 */
export function initSlider(): void {
	const sliders = document.querySelectorAll(
		SLIDER_SELECTOR
	) as NodeListOf<HTMLElement>;
	if (!sliders.length)
		return console.warn("No slider elements found:", SLIDER_SELECTOR);

	sliders.forEach((sliderElement) => initializeSingleSlider(sliderElement));
}

/**
 * Retrieves the current values from the sliders in the structured format required by the API query builder.
 * @returns An object containing the current slider values for filtering.
 */
export function getStructuredSliderValues(): SliderValues {
	const sliders = document.querySelectorAll(
		SLIDER_SELECTOR
	) as NodeListOf<HTMLElement>;
	const structuredPayload: Partial<SliderValues> = {};

	sliders.forEach((sliderElement) => {
		const rangeContainer = sliderElement.querySelector(
			".full_width.range[data-role]"
		) as HTMLElement;
		if (!isHTMLElement(rangeContainer)) return;

		const inputs = rangeContainer.querySelectorAll("input");
		const inputMin = inputs[0] as HTMLInputElement;
		const inputMax = inputs[1] as HTMLInputElement;
		if (!inputMin || !inputMax) return;

		// Base key derivation logic from the provided code
		const minName = inputMin.getAttribute("name") || inputMin.id;
		let baseKey: keyof SliderValues = "vote_average"; // Default to a known key
		let isSingleHandle = false;

		if (minName && minName.includes(".")) {
			baseKey = minName.split(".")[0] as keyof SliderValues;
		} else if (rangeContainer.id === "user_vote_range") {
			baseKey = "vote_count";
			isSingleHandle = true;
		} else if (rangeContainer.id) {
			baseKey = rangeContainer.id.replace("_range", "") as keyof SliderValues;
		}

		if (!baseKey) return;

		const minValue = parseInt(inputMin.value, 10);
		const maxValue = parseInt(inputMax.value, 10);

		// Apply the Range interface structure
		const range: Range = isSingleHandle
			? { gte: maxValue } // vote_count only needs a minimum threshold
			: { gte: minValue, lte: maxValue };

		(structuredPayload as any)[baseKey] = range;
	});

	// Cast and return the final structure
	return structuredPayload as SliderValues;
}
