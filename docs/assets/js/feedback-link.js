/* feedback-link.js — rewrites the feedback link with page question + category
   Usage:
   - In your Markdown admonition, keep a link like:
       !!! help-feedback ""
           [Click here](#) if you have something to add...
     …or add data-feedback-link to any anchor you want rewritten:
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

    // 2) Fallback: active link in sidebar section
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

  // Decide whether a link should be rewritten
  function shouldRewrite(a) {
    if (!a || !a.href) return false;

    // Always rewrite if the author opts-in explicitly
    if (a.hasAttribute('data-feedback-link')) return true;

    // Only auto-rewrite inside our help-feedback admonition
    const inHelpAdmonition = a.closest('.admonition.help-feedback');
    return inHelpAdmonition !== null;
  }

  // You may want to add code here to apply the rewriting logic to the page's links

})();
