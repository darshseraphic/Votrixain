(() => {
  const config = window.VOTRIXAIN_CONFIG || {};
  const year = document.getElementById('year');
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  const copyButton = document.getElementById('copy-url');
  const cleanUrl = document.getElementById('clean-url');
  const copyStatus = document.getElementById('copy-status');
  const repoLink = document.getElementById('repo-link');
  const headerRepoLink = document.getElementById('header-repo-link');
  const themeKey = 'votrixain-theme';

  if (year) year.textContent = String(new Date().getFullYear());

  const validHttpsUrl = (value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const repositoryUrl = config.repositoryUrl || '';
  if (validHttpsUrl(repositoryUrl)) {
    [repoLink, headerRepoLink].forEach((link) => {
      if (!link) return;
      link.href = repositoryUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
    });
    if (repoLink) repoLink.innerHTML = 'View source on GitHub <span aria-hidden="true">↗</span>';
    if (headerRepoLink) headerRepoLink.innerHTML = 'View source <span aria-hidden="true">↗</span>';
  } else {
    [repoLink, headerRepoLink].forEach((link) => {
      if (!link) return;
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('tabindex', '-1');
    });
  }

  const setTheme = (theme) => {
    const isDark = theme === 'dark';
    body.classList.toggle('dark', isDark);
    try { localStorage.setItem(themeKey, theme); } catch { /* Storage can be unavailable in private contexts. */ }
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      themeToggle.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', isDark ? '#2b2b2b' : '#ffffff');
  };

  let savedTheme = '';
  try { savedTheme = localStorage.getItem(themeKey) || ''; } catch { /* Use the default theme. */ }
  setTheme(savedTheme === 'dark' ? 'dark' : 'light');
  themeToggle?.addEventListener('click', () => {
    setTheme(body.classList.contains('dark') ? 'light' : 'dark');
  });

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('is-open', !expanded);
    });
    const closeMenu = () => {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    };

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', closeMenu);
  }

  if (copyButton && cleanUrl && copyStatus) {
    copyButton.addEventListener('click', async () => {
      const value = cleanUrl.textContent.trim();
      try {
        await navigator.clipboard.writeText(value);
        copyStatus.textContent = 'Clean URL copied';
        copyButton.setAttribute('aria-label', 'Clean URL copied');
      } catch {
        copyStatus.textContent = 'Select the URL to copy it';
        copyButton.setAttribute('aria-label', 'Copy unavailable; select the URL manually');
      }
      window.setTimeout(() => {
        copyStatus.textContent = 'The destination stays the same';
        copyButton.setAttribute('aria-label', 'Copy clean URL');
      }, 2400);
    });
  }
})();
