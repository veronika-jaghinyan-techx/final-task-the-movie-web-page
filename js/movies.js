import { formatDate, getSingleMovieUrl, isHTMLButtonElement, isHTMLElement, } from "./utils.js";
import { AUTHORIZATION_TOKEN } from "./env.js";
import { getStructuredSliderValues } from "./slider.js";
// Local state for pagination and API endpoint management
const moviesState = {
    page: 1,
    // Default endpoint for "Popular" movies
    endpoint: (page) => `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`,
};
export function initMovies() {
    const moviesContainer = document.querySelector(".movies-list-section");
    const loadMoreButton = document.querySelector("#loadMoreButton");
    const searchButton = document.querySelector("#searchButton");
    const searchButtonLarge = document.querySelector("#searchButtonLarge");
    /**
     * Fetches movies from the current endpoint and renders them.
     */
    async function getMovies(page) {
        if (!isHTMLElement(moviesContainer) ||
            !isHTMLButtonElement(loadMoreButton)) {
            return;
        }
        if (page === 1) {
            moviesContainer.textContent = "";
        }
        const loader = document.getElementById("loader");
        loader.classList.remove("hide");
        const url = moviesState.endpoint(moviesState.page);
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${AUTHORIZATION_TOKEN}`,
            },
        };
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            const data = await response.json();
            const noResult = document.querySelector(".no-movies");
            if (data.total_pages <= page) {
                loadMoreButton.classList.add("hide");
            }
            else {
                loadMoreButton.classList.remove("hide");
            }
            if (!data.results.length) {
                noResult?.classList.remove("hide");
            }
            else {
                noResult?.classList.add("hide");
            }
            data.results.forEach((movie) => {
                // Create main container
                const movieCard = document.createElement("div");
                movieCard.className = "movie-card";
                // Create image container link
                const movieCardImgLink = document.createElement("a");
                movieCardImgLink.classList.add("movie-card-img-link");
                movieCardImgLink.href = getSingleMovieUrl(movie.id, movie.original_title);
                // Create image div
                const movieCardImg = document.createElement("div");
                movieCardImg.className = "movie-card-img";
                if (movie.poster_path) {
                    movieCardImg.style.backgroundImage = `url(https://media.themoviedb.org/t/p/w220_and_h330_face${movie.poster_path})`;
                    movieCardImg.style.backgroundSize = "cover";
                    movieCardImg.style.backgroundPosition = "center";
                }
                // Create content container
                const movieCardContent = document.createElement("div");
                movieCardContent.className = "movie-card-content";
                // Create title
                const title = document.createElement("h2");
                const titleLink = document.createElement("a");
                titleLink.href = getSingleMovieUrl(movie.id, movie.original_title);
                title.className = "movie-card-title";
                titleLink.className = "movie-card-title-link";
                titleLink.textContent = movie.title;
                title.appendChild(titleLink);
                // Create subtitle
                const subtitle = document.createElement("div");
                subtitle.className = "movie-card-subtitle";
                subtitle.textContent = movie.release_date
                    ? formatDate(movie.release_date)
                    : "";
                // Create overview
                const overview = document.createElement("div");
                overview.className = "movie-card-overview";
                const overviewText = document.createElement("p");
                overviewText.className = "movie-card-overview-text";
                overviewText.textContent = movie.overview;
                overview.appendChild(overviewText);
                // Create rating (Canvas rendering logic)
                const canvas = document.createElement("canvas");
                canvas.width = 40;
                canvas.height = 40;
                const ctx = canvas.getContext("2d");
                const size = 40;
                const center = size / 2;
                const radius = 16;
                const lineWidth = 2;
                const percent = Math.round(movie.vote_average * 10); // 0–10 scale to 0–100 percent
                const startAngle = -Math.PI / 2;
                const endAngle = startAngle + (percent / 100) * (2 * Math.PI);
                // background arc
                ctx.beginPath();
                ctx.arc(center, center, radius, 0, 2 * Math.PI);
                ctx.strokeStyle =
                    percent >= 70
                        ? "rgba(1, 210, 119, 0.4)"
                        : percent >= 40
                            ? "rgba(230, 212, 0, 0.4)"
                            : "rgba(217, 59, 99, 0.4)";
                ctx.lineWidth = lineWidth;
                ctx.stroke();
                // progress arc
                ctx.beginPath();
                ctx.arc(center, center, radius, startAngle, endAngle);
                ctx.strokeStyle =
                    percent >= 70 ? "#01d277" : percent >= 40 ? "#e6d400" : "#d93b63";
                ctx.lineWidth = lineWidth;
                ctx.lineCap = "round";
                ctx.stroke();
                // text (percentage number)
                ctx.font = "600 14px Arial";
                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(String(percent), center - 2, center);
                // text (% symbol)
                ctx.font = "5px Arial";
                ctx.fillText("%", center + ctx.measureText(String(percent)).width + 3, center - 4);
                // add canvas inside image div
                movieCardImg.appendChild(canvas);
                movieCardImgLink.appendChild(movieCardImg);
                // Assemble content
                movieCardContent.appendChild(title);
                movieCardContent.appendChild(subtitle);
                movieCardContent.appendChild(overview);
                movieCard.appendChild(movieCardImgLink);
                movieCard.appendChild(movieCardContent);
                // Append to container
                moviesContainer.appendChild(movieCard);
            });
        }
        catch (error) {
            console.error("Error fetching movies:", error);
        }
        finally {
            loader.classList.add("hide");
        }
    }
    // --- Initial Load and Load More ---
    getMovies(1);
    if (isHTMLButtonElement(loadMoreButton)) {
        loadMoreButton.addEventListener("click", () => {
            moviesState.page++;
            getMovies(moviesState.page);
        });
    }
    /**
     * Constructs the query parameters string from all filter elements.
     */
    function getQueryParams(page) {
        // 1. Genres
        const selectedGenres = document.querySelectorAll(".genre.selected");
        const selectedGenresIds = [];
        selectedGenres.forEach((item) => {
            // The original code uses item.id, which should be the string ID from the API
            selectedGenresIds.push(parseInt(item.id, 10));
        });
        // 2. Sort, Language, Country
        const selectedSort = document.querySelector("#sort-by");
        const selectedLanguage = document.querySelector("#language-filter");
        const selectedCountry = document.querySelector("#country-filter");
        const allReleases = document.querySelector("#all_releases");
        const getAllCountries = document.querySelector("#all_release_countries");
        // 3. Keywords
        const selectedKeywordIds = Array.from(document.querySelectorAll("#badgeArea > span"), (span) => span.dataset.id);
        // 4. Release Type
        const releaseTypes = Array.from(document.querySelectorAll('input[name="release_type"]:checked')).map((input) => input.value);
        // 5. Date Range
        const fromInput = document.getElementById("date_from");
        const toInput = document.getElementById("date_to");
        // 6. Sliders (Vote Count, Vote Average, Runtime)
        const sliderValues = getStructuredSliderValues();
        const obj = {
            page,
            sort_by: selectedSort ? selectedSort.dataset.value : undefined,
            with_original_language: selectedLanguage
                ? selectedLanguage.dataset.value
                : undefined,
            with_origin_country: allReleases?.checked === true
                ? undefined
                : getAllCountries?.checked === true
                    ? undefined
                    : selectedCountry?.dataset.value,
            with_genres: selectedGenresIds.length ? selectedGenresIds : undefined,
            // Map slider values directly to the expected dot notation keys
            "vote_count.gte": sliderValues.vote_count.gte,
            "vote_average.gte": sliderValues.vote_average.gte,
            "vote_average.lte": sliderValues.vote_average.lte,
            "with_runtime.gte": sliderValues.with_runtime.gte,
            "with_runtime.lte": sliderValues.with_runtime.lte,
            with_keywords: selectedKeywordIds.length ? selectedKeywordIds : undefined,
            with_release_type: allReleases?.checked === true
                ? undefined
                : releaseTypes.length
                    ? releaseTypes
                    : undefined,
            // Release date uses 'primary_release_date' for discover endpoint
            "primary_release_date.gte": fromInput?.value || undefined,
            "primary_release_date.lte": toInput?.value || undefined,
        };
        // Only include the required OR keys for pipe separator (TMDB specific)
        const OR_KEYS = ["with_release_type", "with_companies", "with_genres"];
        // Universal serialize function
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(obj)) {
            if (value == null ||
                value === "" ||
                (Array.isArray(value) && !value.length) ||
                (typeof value === "number" && value === 0))
                continue;
            if (key.includes(".")) {
                // Direct dot-notation keys (e.g., vote_average.gte)
                params.append(key, String(value));
            }
            else if (Array.isArray(value)) {
                // Arrays: only OR_KEYS use '|', others use ','
                const separator = OR_KEYS.includes(key) ? "|" : ",";
                params.append(key, value.join(separator));
            }
            else {
                // Simple keys
                params.append(key, String(value));
            }
        }
        // Append the mandatory language
        params.append("language", "en-US");
        return params.toString();
    }
    // --- Search Button Click Handler ---
    if (isHTMLButtonElement(searchButton)) {
        searchButton.addEventListener("click", () => {
            moviesState.page = 1; // reset page
            // Replace endpoint with discover endpoint using filters
            moviesState.endpoint = (page) => {
                const queryParams = getQueryParams(page);
                return `https://api.themoviedb.org/3/discover/movie?${queryParams}`;
            };
            getMovies(moviesState.page);
        });
    }
    // Also hook up the large search button
    if (isHTMLButtonElement(searchButtonLarge)) {
        searchButtonLarge.addEventListener("click", () => {
            if (isHTMLButtonElement(searchButton))
                searchButton.click();
        });
    }
    /**
     * Fetches movie genres and populates the filter container.
     */
    async function getGenres() {
        const url = "https://api.themoviedb.org/3/genre/movie/list?language=en";
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${AUTHORIZATION_TOKEN}`,
            },
        };
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            const data = await response.json();
            const genresContainer = document.querySelector(".genres-container");
            if (!isHTMLElement(genresContainer))
                return;
            data.genres.forEach((genre) => {
                const genreEl = document.createElement("div");
                genreEl.classList.add("genre");
                genreEl.textContent = genre.name;
                genreEl.id = String(genre.id); // Set ID for retrieval in getQueryParams
                genreEl.addEventListener("click", () => {
                    genreEl.classList.toggle("selected");
                });
                genresContainer.appendChild(genreEl);
            });
        }
        catch (error) {
            console.error("Error fetching genres:", error);
        }
    }
    getGenres();
    /**
     * Handles the accordion/toggle behavior for filter headers (Genres, Sort, etc.).
     */
    const sortFilterHeaders = document.querySelectorAll("[data-sort-filter-header]");
    sortFilterHeaders.forEach((header) => {
        const arrow = header.querySelector(".sort-filter-card-arrow");
        const menuId = header.getAttribute("aria-controls");
        if (!menuId)
            return;
        const menu = document.getElementById(menuId);
        if (!isHTMLElement(menu))
            return;
        // Initial state setup for accessibility
        const isHidden = menu.classList.contains("hide");
        menu.setAttribute("aria-hidden", String(isHidden));
        header.setAttribute("aria-expanded", String(!isHidden));
        header.addEventListener("click", () => {
            menu.classList.toggle("hide");
            const isHidden = menu.classList.contains("hide");
            menu.setAttribute("aria-hidden", String(isHidden));
            header.setAttribute("aria-expanded", String(!isHidden));
            isHidden
                ? arrow?.classList.remove("rotate-90deg")
                : arrow?.classList.add("rotate-90deg");
        });
        header.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                menu.classList.toggle("hide");
                const isHidden = menu.classList.contains("hide");
                menu.setAttribute("aria-hidden", String(isHidden));
                header.setAttribute("aria-expanded", String(!isHidden));
            }
        });
    });
}
