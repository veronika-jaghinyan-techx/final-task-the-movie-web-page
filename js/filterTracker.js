const initialValues = new Map();
const searchButton = document.getElementById("searchButton");
const filterSection = document.querySelector(".sort-filter-section");
function getTrackableControls() {
    return filterSection.querySelectorAll('input[type="checkbox"], input[type="date"], #keywordSearch, ' +
        'input[type="text"][id^="vote_average"], input[type="text"][id^="with_runtime"], ' +
        'input[type="text"][name="with_runtime.gte"], input[type="text"][name="with_runtime.lte"], ' +
        'input[type="text"][name="vote_average.gte"], input[type="text"][name="vote_average.lte"], ' +
        "#sort-by, #country-filter, #language-filter, .k-draghandle");
}
function getCurrentControlValue(element) {
    if (element instanceof HTMLInputElement) {
        if (element.type === "checkbox")
            return element.checked;
        return element.value.trim();
    }
    if (element.classList.contains("select-btn"))
        return element.textContent?.trim() || "";
    if (element.classList.contains("k-draghandle"))
        return element.getAttribute("aria-valuenow") || "";
    return "";
}
function storeInitialState() {
    if (!filterSection)
        return;
    Array.from(getTrackableControls()).forEach((control) => {
        const key = control.id ||
            control.getAttribute("name") ||
            (control.classList.contains("k-draghandle")
                ? `handle-${Math.random()}`
                : control.classList[0]);
        if (key)
            initialValues.set(key, getCurrentControlValue(control));
    });
}
function checkForGenreChanges() {
    const genreContainer = filterSection.querySelector(".genres-container");
    if (genreContainer) {
        const selectedGenres = genreContainer.querySelectorAll(".genre.selected");
        return selectedGenres.length > 0;
    }
    return false;
}
function checkForChanges() {
    let hasChanged = Array.from(getTrackableControls()).some((control) => {
        const key = control.id ||
            control.getAttribute("name") ||
            (control.classList.contains("k-draghandle")
                ? `handle-${control.getAttribute("data-handle-id")}`
                : control.classList[0]);
        const initialValue = initialValues.get(key);
        const currentValue = getCurrentControlValue(control);
        return (initialValue !== undefined &&
            String(currentValue) !== String(initialValue));
    });
    if (!hasChanged)
        hasChanged = checkForGenreChanges();
    if (searchButton)
        searchButton.disabled = !hasChanged;
}
function initializeMutationObservers() {
    const sortButton = document.getElementById("sort-by");
    const languageButton = document.getElementById("language-filter");
    const genreContainer = filterSection.querySelector(".genres-container");
    const sliderHandles = filterSection.querySelectorAll(".k-draghandle");
    sliderHandles.forEach((handle, index) => handle.setAttribute("data-handle-id", String(index)));
    const observerCallback = () => {
        checkForChanges();
    };
    const config = {
        subtree: true,
        attributes: true,
        attributeFilter: ["aria-valuenow", "style"],
    };
    if (sortButton)
        new MutationObserver(observerCallback).observe(sortButton, {
            attributes: true,
            childList: true,
            characterData: true,
        });
    if (languageButton)
        new MutationObserver(observerCallback).observe(languageButton, {
            attributes: true,
            childList: true,
            characterData: true,
        });
    if (genreContainer)
        new MutationObserver(observerCallback).observe(genreContainer, {
            subtree: true,
            attributes: true,
            childList: true,
            characterData: true,
        });
    sliderHandles.forEach((handle) => new MutationObserver(observerCallback).observe(handle, config));
}
export function initializeFilterTracker() {
    if (!searchButton || !filterSection)
        return;
    storeInitialState();
    initializeMutationObservers();
    filterSection.addEventListener("change", checkForChanges);
    filterSection.addEventListener("input", checkForChanges);
    document.addEventListener("mousedown", (event) => {
        if (event.target.classList.contains("k-draghandle"))
            checkForChanges();
    });
    document.addEventListener("mouseup", (event) => {
        if (event.target.classList.contains("k-draghandle"))
            checkForChanges();
    });
    toggleLargeSearchButton();
}
function toggleLargeSearchButton() {
    const searchButton = document.getElementById("searchButton");
    const searchButtonLarge = document.getElementById("searchButtonLarge");
    if (!searchButton || !searchButtonLarge)
        return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting && !searchButton.disabled) {
                searchButtonLarge.classList.remove("hide");
            }
            else {
                searchButtonLarge.classList.add("hide");
            }
        });
    }, { threshold: 0 });
    observer.observe(searchButton);
    // Optional: dynamically watch for button enabling/disabling
    const mutationObserver = new MutationObserver(() => {
        if (!searchButton.disabled && !isElementInViewport(searchButton)) {
            searchButtonLarge.classList.remove("hide");
        }
        else {
            searchButtonLarge.classList.add("hide");
        }
    });
    mutationObserver.observe(searchButton, {
        attributes: true,
        attributeFilter: ["disabled"],
    });
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            rect.left < window.innerWidth &&
            rect.right > 0);
    }
}
