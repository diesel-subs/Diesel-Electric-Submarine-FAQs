/* feedback-link.js — rewrites the feedback link with page question + category
   Usage in Markdown:
     !!! help-feedback ""
         [Click here](#) if you have something to add...

   Or anywhere:
     <a href="#" data-feedback-link>Click here</a>
*/
(function () {
  // --- Helper: extract current page's main question title ---
  function getQuestion() {
    const h1 =
      document.querySelector('article h1') ||
      document.querySelector('.md-content__inner h1') ||
      document.querySelector('.md-typeset h1');
    return h1 ? h1.textContent.trim() : '';
  }

  // --- Helper: extract category from breadcrumb or sidebar ---
  function getCategory() {
    // 1) Breadcrumb (modern Material builds)
    const bc = document.querySelector('[data-md-component="breadcrumb"]');
    if (bc) {
      const items = bc.querySelectorAll('li, .md-breadcrumb__item');
      if (items.length >= 2) {
        const node =
          items[items.length - 2].querySelector('a, span, .md-ellipsis') ||
          items[items.length - 2];
        const txt = node && node.textContent ? node.textContent.trim() : '';
        if (txt) return txt;
      }
    }

    // 2) Fallback: active section label in primary nav
    const active = document.querySelector('.md-nav__link--active');
    if (active) {
      const section = active.closest('.md-nav__item');
      if (section) {
        const label =
          section.querySelector(':scope > .md-nav__link .md-ellipsis') ||
          section.querySelector(':scope > .md-nav__link');
        if (label && label.textContent) return label.textContent.trim();
      }
    }
    return '';
  }

  // --- Build full URL to feedback form ---
  function buildUrl() {
    const question = getQuestion();
    const category = getCategory();
    const url = new URL('https://dieselsubs.com/index.php');
    if (question) url.searchParams.set('question', question);
    if (category) url.searchParams.set('category', category);
    return url.toString();
  }

  // --- Decide whether a link should be rewritten ---
  function shouldRewrite(a) {
    if (!a || !a.href) return false;

    // Explicit opt-in
    if (a.hasAttribute('data-feedback-link')) return true;

    // Auto-rewrite only inside our help-feedback admonition
    const inHelpAdmonition = a.closest('.admonition.help-feedback');
    return inHelpAdmonition !== null;
  }

  // --- Rewrite matching links on the current page ---
  function rewriteLinks() {
    const href = buildUrl();
    const anchors = Array.from(document.querySelectorAll('a[href]')).filter(shouldRewrite);

    anchors.forEach((a) => {
      // Idempotent: only change if needed
      if (a.getAttribute('href') !== href) a.setAttribute('href', href);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  // --- Initialize on first load and on every SPA navigation in MkDocs Material ---
  function init() {
    rewriteLinks();
  }

  if (window.document$ && typeof window.document$.subscribe === 'function') {
    window.document$.subscribe(() => {
      // Runs after each page render in MkDocs Material
      init();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
