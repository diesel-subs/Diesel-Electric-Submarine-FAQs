(function () {
  // Run after MkDocs Material has rendered the page
  document.addEventListener("DOMContentLoaded", () => {
    const hash = window.location.hash.toLowerCase();
    if (hash === "#summary") {
      // Find the tab label that says "Summary" and click it
      const summaryTab = Array.from(
        document.querySelectorAll('.md-tabs__link, .tabbed-labels > label')
      ).find(el => el.textContent.trim().toLowerCase() === "summary");

      if (summaryTab) {
        summaryTab.click();
        // Scroll slightly up to ensure tab header visible
        setTimeout(() => window.scrollBy(0, -50), 100);
      }
    }
  });
})();
