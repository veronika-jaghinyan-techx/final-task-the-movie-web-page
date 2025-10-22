import { movieLanguages } from "./constants.js";
export function initCustomSelects(selector = ".custom-select") {
    const selects = document.querySelectorAll(selector);
    selects.forEach((container) => {
        const btn = container.querySelector(".select-btn");
        const optionsList = container.querySelector(".select-options");
        if (!btn || !optionsList)
            return;
        //1. Populate Languages
        if (container.id === "languageSelect") {
            const searchLi = optionsList.querySelector(".select-search-li");
            movieLanguages.reverse().forEach((language) => {
                const liEl = document.createElement("li");
                liEl.textContent = language.label;
                liEl.dataset.value = language.code;
                if (searchLi) {
                    searchLi.insertAdjacentElement("afterend", liEl);
                }
                else {
                    optionsList.appendChild(liEl);
                }
            });
        }
        const searchInput = container.querySelector(".select-search-input");
        const optionItems = Array.from(optionsList.querySelectorAll("li")).filter((li) => !li.classList.contains("select-search-li"));
        //2. Filtering Logic
        const filterOptions = () => {
            if (!searchInput)
                return;
            const filterText = searchInput.value.toLowerCase().trim();
            optionItems.forEach((item) => {
                const itemText = (item.textContent || "").toLowerCase();
                if (itemText.includes(filterText)) {
                    item.style.display = "";
                }
                else {
                    item.style.display = "none";
                }
            });
        };
        if (searchInput) {
            searchInput.addEventListener("input", filterOptions);
        }
        //3. Dropdown Toggle & Focus
        btn.addEventListener("click", () => {
            const isOpen = optionsList.classList.toggle("show");
            btn.setAttribute("aria-expanded", String(isOpen));
            if (isOpen) {
                searchInput?.focus();
                if (searchInput) {
                    searchInput.value = "";
                    filterOptions();
                }
            }
        });
        //4. Select Option Handler
        optionsList.addEventListener("click", (e) => {
            const target = e.target;
            if (target.tagName === "LI" &&
                !target.classList.contains("select-search-li")) {
                btn.textContent = target.textContent;
                btn.dataset.value = target.dataset.value || "";
                optionsList.classList.remove("show");
                btn.setAttribute("aria-expanded", "false");
                if (searchInput) {
                    searchInput.value = "";
                    filterOptions();
                }
            }
        });
        // 5. Close on Outside Click
        document.addEventListener("click", (e) => {
            const target = e.target;
            if (!target.closest(".custom-select")) {
                optionsList.classList.remove("show");
                btn.setAttribute("aria-expanded", "false");
                optionsList.setAttribute("aria-hidden", "true");
                if (searchInput) {
                    searchInput.value = "";
                    filterOptions();
                }
            }
        });
    });
}
