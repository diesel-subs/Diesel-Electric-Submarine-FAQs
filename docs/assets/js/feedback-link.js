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

  // --- Helper: extract category from breadcrumb, sidebar, or URL path ---
  function getCategory() {
    // 1) Breadcrumb (MkDocs Material ≥8/9)
    const bc = document.querySelector('[data-md-component="breadcrumb"]');
    if (bc) {
      const items = Array.from(bc.querySelectorAll('li'));
      if (items.length >= 2) {
        const node = items[items.length - 2];
        const ellipsis = node.querySelector('.md-ellipsis');
        const txt = (ellipsis ? ellipsis.textContent : node.textContent || '').trim();
        if (txt) return txt;
      }
    }

    // 2) Sidebar: prefer the active *parent* item label
    const activeLink = document.querySelector('.md-nav__link--active');
    if (activeLink) {
      const pageItem = activeLink.closest('.md-nav__item');
      const parentItem = pageItem && pageItem.parentElement
        ? pageItem.parentElement.closest('.md-nav__item')
        : null;
      const labelNode = parentItem
        ? (parentItem.querySelector(':scope > .md-nav__link .md-ellipsis') ||
          parentItem.querySelector(':scope > .md-nav__link'))
        : null;
      const labelTxt = labelNode && labelNode.textContent ? labelNode.textContent.trim() : '';
      if (labelTxt) return labelTxt;
    }

    // 3) URL path fallback: /categories/<Category>/...
    const m = decodeURIComponent(location.pathname
