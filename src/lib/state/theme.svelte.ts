import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const THEME_COLOR = { light: '#3D2BFF', dark: '#1b1813' } as const;

function resolveInitial(): Theme {
  if (!browser) return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// The inline script in app.html has already set the class for first paint;
// this mirrors that decision so the reactive state agrees, then keeps both in
// sync on every toggle.
let current = $state<Theme>(resolveInitial());

function apply(theme: Theme) {
  if (!browser) return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

export const theme = {
  get value(): Theme {
    return current;
  },
  toggle() {
    current = current === 'dark' ? 'light' : 'dark';
    if (browser) localStorage.setItem(STORAGE_KEY, current);
    apply(current);
  }
};
