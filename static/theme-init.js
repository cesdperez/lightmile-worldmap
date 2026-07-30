// Apply the saved/system theme before first paint to avoid a flash of the wrong
// theme. Kept as an external file (not inline in app.html) so it satisfies the
// strict `script-src 'self'` CSP without needing a hash or 'unsafe-inline'.
// Mirrors the theme logic in src/lib/state; keep the two in sync.
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored ? stored === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0e0e10' : '#f4f3ef');
  } catch {
    /* localStorage or matchMedia may be unavailable; fall back to the default light theme */
  }
})();
