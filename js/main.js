import { initHeader } from "./header.js";
import { initMovies } from "./movies.js";
import { initCustomSelects } from "./customSelect.js";
import { initSlider } from "./slider.js";
import { initSearchInput } from "./searchInput.js";
import { initReleaseDates } from "./releaseDates.js";
import { initTooltip } from "./tooltip.js";
import { initializeFilterTracker } from "./filterTracker.js";
/**
 * Main initialization function that runs when the DOM is ready.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Initialize core UI and functionality
    initHeader();
    initCustomSelects();
    initSlider();
    initSearchInput();
    initTooltip();
    initializeFilterTracker();
    // Initialize filters that require async data or specific setup
    initReleaseDates();
    // Load and manage movie listings (must run last to use filter setup)
    initMovies();
});
