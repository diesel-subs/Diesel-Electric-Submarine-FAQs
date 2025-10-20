(function () {
  const FLAG = 'ds_seenIntro_v1';      // bump to re-show
  const INTRO_SEGMENT = 'intro/';

  function isIntroPath() {
    const p = location.pathname;
    return p.endsWith('/intro/') || p.endsWith('/intro/index.html');
  }

  // Build an absolute intro URL using <link rel="canonical"> when available
  function introUrl() {
    const canon = document.querySelector('link[rel="canonical"]');
    if (canon && canon.href) {
      // ensure we target the site root, not the current subpath
      const u = new URL(canon.href);
      u.pathname = u.pathname.replace(/[^/]+$/, ''); // drop filename if present
      if (!u.pathname.endsWith('/')) u.pathname += '/';
      u.pathname += 'intro/';
      return u.toString();
    }
    // fallback: origin + top-level site path + intro/
    const base = location.origin + location.pathname.split('/intro/')[0].replace(/\/+$/, '') + '/';
    return base + INTRO_SEGMENT;
  }

  // Optional: allow reset via ?intro=reset
  const urlHas = (k, v) => new URLSearchParams(location.search).get(k) === v;
  if (urlHas('intro', 'reset')) localStorage.removeItem(FLAG);

  // Only redirect if: not seen, not already on intro
  if (!localStorage.getItem(FLAG) && !isIntroPath()) {
    // remember intended destination
    sessionStorage.setItem('ds_intended', location.pathname + location.search + location.hash);
    // ABSOLUTE redirect; prevents /intro/intro/ stacking
    location.replace(introUrl());
  }

  // Mark as seen when user is on intro page
  if (isIntroPath()) {
    localStorage.setItem(FLAG, '1');
    // Optional: send them to the intended page when they click your “Continue” button
    // document.querySelector('#continue')?.addEventListener('click', () => {
    //   const next = sessionStorage.getItem('ds_intended') || '/';
    //   location.assign(next);
    // });
  }
})();
