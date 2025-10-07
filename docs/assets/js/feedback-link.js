(function () {
  window._feedbackEnhancerLoaded = true;

  function getQuestion() {
    const h1 =
      document.querySelector('article h1') ||
      document.querySelector('.md-content__inner h1') ||
      document.querySelector('.md-typeset h1');
    return h1 ? h1.textContent.trim() : '';
  }

  function getCategory() {
    // Prefer breadcrumb: Home › Category › Question
    const bc = document.querySelector(
      '.md-breadcrumb li:nth-child(2) a, .md-breadcrumb li:nth-child(2) span'
    );
    if (bc && bc.textContent.trim()) return bc.textContent.trim();

    // Fallback: active nav section
    const active = document.querySelector(
      '.md-nav__item--active > .md-nav__link, nav .md-nav__link--active'
    );
    return active ? active.textContent.trim() : '';
  }

  function enhanceFeedbackLinks() {
    const question = getQuestion();
    if (!question) return;

    const category = getCategory();

    const links = document.querySelectorAll(
      '.admonition.help-feedback a[href], .help-feedback a[href]'
    );
    if (!links.length) return;

    links.forEach((a) => {
      // Skip if already processed
      if (a.dataset.postEnhanced === '1') return;
      a.dataset.postEnhanced = '1';

      a.addEventListener('click', (ev) => {
        const rawHref = a.getAttribute('href');
        if (!rawHref) return;

        let url;
        try {
          url = new URL(rawHref, window.location.origin);
        } catch {
          return; // malformed href — let browser handle
        }

        // Build a POST form
        ev.preventDefault();

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url.origin + url.pathname;

        // Respect target (e.g., _blank)
        const tgt = a.getAttribute('target');
        if (tgt) form.setAttribute('target', tgt);

        // 1) Add our fields
        const addField = (name, value) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        };
        addField('question', question);
        if (category) addField('category', category);

        // 2) Convert any existing query params on the link to POST fields too
        const params = new URLSearchParams(url.search);
        params.forEach((v, k) => {
          // If question/category already set, don't overwrite
          if ((k === 'question' && question) || (k === 'category' && category)) return;
          addField(k, v);
        });

        // 3) If there’s a hash, pass it along as a field (optional)
        if (url.hash) addField('_hash', url.hash.substring(1));

        document.body.appendChild(form);
        form.submit();
      });
    });
  }

  if (window.document$ && typeof document$.subscribe === 'function') {
    document$.subscribe(() => requestAnimationFrame(enhanceFeedbackLinks));
  } else {
    document.addEventListener('DOMContentLoaded', () =>
      requestAnimationFrame(enhanceFeedbackLinks)
    );
  }
  setTimeout(enhanceFeedbackLinks, 300);
})();