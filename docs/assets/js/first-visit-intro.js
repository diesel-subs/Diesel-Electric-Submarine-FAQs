(function () {
  const FLAG = "ds_seenIntro_v1";     // bump this to re-show intro after changes
  const INTRO_PATH = "intro/";        // the folder produced from intro.md

  // Quick helpers
  const urlHas = (key, val) => new URLSearchParams(location.search).get(key) === val;
  const isIntroPath = () => {
    const p = location.pathname;
    return p.endsWith("/intro/") || p.endsWith("/intro/index.html");
  };

  // Support reset via query param
  if (urlHas("intro", "reset")) {
    localStorage.removeItem(FLAG);
    // fall through; next block will redirect to intro if not seen
  }

  // If we haven't shown intro yet and we're not already on intro, redirect
  if (!localStorage.getItem(FLAG) && !isIntroPath()) {
    // remember where the user wanted to go
    sessionStorage.setItem("ds_intended", location.pathname + location.search + location.hash);

    // build a robust base from <link rel="canonical"> if present, else from path
    const canonical = document.querySelector('link[rel="canonical"]');
    const base = canonical
      ? canonical.href.replace(/[^/]+$/, "")
      : (location.origin + location.pathname.replace(/[^/]+$/, ""));
    location.href = base + INTRO_PATH;
    return;
  }

  // If we're on intro, expose a function the button can call
  if (isIntroPath()) {
    window.dsMarkIntroSeen = function () {
      localStorage.setItem(FLAG, "1");
      const intended = sessionStorage.getItem("ds_intended");
      sessionStorage.removeItem("ds_intended");
      // fallback to site root if we don't have an intended page
      location.href = intended || "/";
    };
  }
})();
