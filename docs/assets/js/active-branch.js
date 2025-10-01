(function () {
  function onEveryPage(fn) {
    if (window.document$ && typeof window.document$.subscribe === "function") {
      window.document$.subscribe(fn);
    } else {
      document.addEventListener("DOMContentLoaded", fn);
      window.addEventListener("load", fn);
    }
  }

  const norm = (u) => {
    try {
      const url = new URL(u, window.location.origin);
      let p = url.pathname.replace(/index\.html?$/i, "");
      if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
      return p;
    } catch { return ""; }
  };

  function markByURL() {
    // Ensure sidebar exists
    const sidebar = document.querySelector(".md-sidebar, .md-nav");
    if (!sidebar) return;

    // Clear previous mark
    document.querySelectorAll(".is-active-branch").forEach((el) => el.classList.remove("is-active-branch"));

    const here = norm(window.location.href);
    const links = Array.from(document.querySelectorAll(".md-nav a.md-nav__link[href]"));
    if (!links.length) return;

    // Find best matching link for current page
    let best = null, bestScore = -1;
    for (const a of links) {
      const p = norm(a.href);
      if (!p) continue;

      let score = 0;
      const max = Math.min(here.length, p.length);
      while (score < max && here[score] === p[score]) score++;
      if (p === here) score += 1000; // strong boost for exact match

      if (score > bestScore) { bestScore = score; best = a; }
    }
    if (!best) return;

    // Determine owning category <li>
    let owner = best.closest("nav.md-nav")?.parentElement;
    if (!owner || !owner.classList.contains("md-nav__item")) {
      owner = best.closest(".md-nav__item");
    }
    if (!owner) return;

    owner.classList.add("is-active-branch");
  }

  onEveryPage(() => {
    // Try immediately and then retry a few times to catch late sidebar renders
    markByURL();
    let tries = 0, id = setInterval(() => {
      markByURL();
      if (++tries >= 10) clearInterval(id);
    }, 100);
  });

  window.addEventListener("hashchange", markByURL);

  // Observe sidebar changes (e.g., collapses/expands)
  const obs = new MutationObserver(markByURL);
  const startObs = () => {
    const target = document.querySelector(".md-sidebar, .md-nav");
    if (target) obs.observe(target, { childList: true, subtree: true });
    else setTimeout(startObs, 200);
  };
  startObs();
})();
