(function () {
  // Simple debug flag so you can verify the script loaded
  window._feedbackEnhancerLoaded = true;

  function enhanceFeedbackLinks() {
    // Find the page’s question (H1) in common Material locations
    const h1 =
      document.querySelector('article h1') ||
      document.querySelector('.md-content__inner h1') ||
      document.querySelector('.md-typeset h1');

    if (!h1) return;
    const question = h1.textContent.trim();
    if (!question) return;

    // Find links inside your "help-feedback" admonitions
    const links = document.querySelectorAll(
      '.admonition.help-feedback a[href], .help-feedback a[href]'
    );
    if (!links.length) return;

    links.forEach((a) => {
      const rawHref = a.getAttribute('href');
      if (!rawHref) return;

      // Build a URL safely (supports absolute + relative)
      let url;
      try {
        url = new URL(rawHref, window.location.origin);
      } catch {
        return;
      }

      // If question already present, don't duplicate
      const existing = new URLSearchParams(url.search);
      if (existing.has('question')) return;

      // Build "question" FIRST, then append any existing params
      const first = `question=${encodeURIComponent(question)}`;
      const others = url.search ? url.search.replace(/^\?/, '') : '';
      const combined = others ? `${first}&${others}` : first;

      url.search = combined;
      a.setAttribute('href', url.toString());
    });
  }

  // Run after Material instant navigation swaps content
  if (window.document$ && typeof document$.subscribe === 'function') {
    document$.subscribe(() => {
      // Slight delay to ensure the new page is fully in the DOM
      requestAnimationFrame(enhanceFeedbackLinks);
    });
  } else {
    // Fallback for no-SPA / dev server without instant navigation
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(enhanceFeedbackLinks);
    });
  }

  // Also catch late content (rare), run once more after a tick
  setTimeout(enhanceFeedbackLinks, 300);
})();
