import { isHTMLElement } from "./utils.js";
/**
 * Initializes a global tooltip component that activates on elements with a `data-tooltip` attribute.
 * @param selector The CSS selector for the tooltip element (default: #globalTooltip).
 */
export function initTooltip(selector = "#globalTooltip") {
    const tooltip = document.querySelector(selector);
    if (!isHTMLElement(tooltip))
        return;
    function showTooltip(e) {
        const target = e.target;
        if (!(target instanceof HTMLElement) || !tooltip)
            return;
        const text = target.getAttribute("data-tooltip");
        if (!text)
            return;
        tooltip.textContent = text;
        const rect = target.getBoundingClientRect();
        // Calculate position to center the tooltip above the element
        tooltip.style.top = `${rect.top + window.scrollY}px`;
        tooltip.style.left = `${rect.left + rect.width / 2 + window.scrollX}px`;
        tooltip.style.opacity = "1";
        tooltip.style.visibility = "visible";
    }
    function hideTooltip() {
        if (!tooltip)
            return;
        tooltip.style.opacity = "0";
        tooltip.style.visibility = "hidden";
    }
    // Use capture phase (true) to catch mouseenter events efficiently on all elements
    document.addEventListener("mouseenter", showTooltip, true);
    document.addEventListener("mouseleave", hideTooltip, true);
}
